// src/controllers/deviceData.controller.ts
import { Request, Response } from 'express';
import DeviceData from '../models/DeviceData';
import Device from '../models/Device';
import { Types } from 'mongoose';

/**
 * Get device data by device ID or deviceName
 * GET /api/device-data/:device?limit=100&skip=0&sort=-createdAt
 */
export async function getDeviceData (req: Request, res: Response) {
  try {
    const { device } = req.params;
    // res.locals.userId contains the decoded JWT (with 'id' and 'email' fields)
    const userId = res.locals.userId?.id

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    // Query parameters for pagination and filtering
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = parseInt(req.query.skip as string) || 0;
    const sort = (req.query.sort as string) || '-createdAt'; // Default: newest first
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    // Find device by ID or deviceName
    let deviceDoc;
    if (Types.ObjectId.isValid(device)) {
      deviceDoc = await Device.findById(device);
    } else {
      deviceDoc = await Device.findOne({ deviceName: device });
    }

    if (!deviceDoc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Device not found' 
      });
    }

    // Build query
    const query: any = {
      userId: userId,
      deviceId: deviceDoc._id
    };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Get total count for pagination
    const total = await DeviceData.countDocuments(query);

    // Fetch data with pagination
    const data = await DeviceData.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .select('-__v') // Exclude version key
      .lean(); // Convert to plain JavaScript objects

    return res.status(200).json({
      success: true,
      data: {
        device: {
          _id: deviceDoc._id,
          deviceName: deviceDoc.deviceName,
          type: deviceDoc.type
        },
        readings: data,
        pagination: {
          total,
          limit,
          skip,
          hasMore: skip + data.length < total,
          page: Math.floor(skip / limit) + 1,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching device data:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error fetching device data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get latest reading from a device
 * GET /api/device-data/:device/latest
 */
export async function getLatestDeviceData (req: Request, res: Response) {
  try {
    const { device } = req.params;
    const userId = res.locals.userId?.id || res.locals.userId;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    // Find device
    let deviceDoc;
    if (Types.ObjectId.isValid(device)) {
      deviceDoc = await Device.findById(device);
    } else {
      deviceDoc = await Device.findOne({ deviceName: device });
    }

    if (!deviceDoc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Device not found' 
      });
    }

    // Get latest reading
    const latestData = await DeviceData.findOne({
      userId: userId,
      deviceId: deviceDoc._id
    })
      .sort('-createdAt')
      .select('-__v')
      .lean();

    if (!latestData) {
      return res.status(404).json({ 
        success: false, 
        message: 'No data found for this device' 
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        device: {
          _id: deviceDoc._id,
          deviceName: deviceDoc.deviceName,
          type: deviceDoc.type
        },
        latest: latestData
      }
    });

  } catch (error) {
    console.error('Error fetching latest device data:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error fetching latest device data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get aggregated statistics for a device
 * GET /api/device-data/:device/stats?field=temperature&period=day
 */
export async function getDeviceStats (req: Request, res: Response) {
  try {
    const { device } = req.params;
    const userId = res.locals.userId?.id || res.locals.userId;
    const field = req.query.field as string; // e.g., 'temperature', 'humidity'
    const period = req.query.period as string || 'day'; // 'hour', 'day', 'week', 'month'

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    if (!field) {
      return res.status(400).json({ 
        success: false, 
        message: 'Field required (query param: field)' 
      });
    }

    // Find device
    let deviceDoc;
    if (Types.ObjectId.isValid(device)) {
      deviceDoc = await Device.findById(device);
    } else {
      deviceDoc = await Device.findOne({ deviceName: device });
    }

    if (!deviceDoc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Device not found' 
      });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case 'hour':
        startDate.setHours(now.getHours() - 1);
        break;
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 1);
    }

    // Aggregate statistics
    const stats = await DeviceData.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          deviceId: deviceDoc._id,
          createdAt: { $gte: startDate },
          [`sensorsData.${field}`]: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avg: { $avg: `$sensorsData.${field}` },
          min: { $min: `$sensorsData.${field}` },
          max: { $max: `$sensorsData.${field}` },
          count: { $sum: 1 },
          latest: { $last: `$sensorsData.${field}` }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `No ${field} data found for this device in the specified period` 
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        device: {
          _id: deviceDoc._id,
          deviceName: deviceDoc.deviceName,
          type: deviceDoc.type
        },
        field,
        period,
        stats: {
          average: stats[0].avg,
          minimum: stats[0].min,
          maximum: stats[0].max,
          count: stats[0].count,
          latest: stats[0].latest
        },
        dateRange: {
          start: startDate,
          end: now
        }
      }
    });

  } catch (error) {
    console.error('Error fetching device statistics:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error fetching device statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// src/app.ts or src/index.ts
// Add this route to your main app file:
/*
import deviceDataRoutes from './routes/deviceData.routes';

app.use('/api/device-data', deviceDataRoutes);
*/


// Example API Usage from Frontend:

/*
// 1. Get paginated device data
fetch('/api/device-data/iot1?limit=50&skip=0&sort=-createdAt')
  .then(res => res.json())
  .then(data => console.log(data));

// Response:
{
  "success": true,
  "data": {
    "device": {
      "_id": "...",
      "deviceName": "iot1",
      "type": "esp32-generic"
    },
    "readings": [
      {
        "_id": "...",
        "userId": "...",
        "deviceId": "...",
        "sensorsData": {
          "temperature": 23.5,
          "humidity": 65
        },
        "createdAt": "2025-01-15T10:30:00Z",
        "updatedAt": "2025-01-15T10:30:00Z"
      }
      // ... more readings
    ],
    "pagination": {
      "total": 500,
      "limit": 50,
      "skip": 0,
      "hasMore": true,
      "page": 1,
      "totalPages": 10
    }
  }
}

// 2. Get latest reading
fetch('/api/device-data/iot1/latest')
  .then(res => res.json())
  .then(data => console.log(data.data.latest.sensorsData));

// 3. Get statistics
fetch('/api/device-data/iot1/stats?field=temperature&period=day')
  .then(res => res.json())
  .then(data => console.log(data.data.stats));

// 4. Get data with date range
fetch('/api/device-data/iot1?startDate=2025-01-01&endDate=2025-01-15')
  .then(res => res.json())
  .then(data => console.log(data));
*/