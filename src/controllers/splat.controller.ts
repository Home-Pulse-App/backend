import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { getGridFSBucket } from '../utils/gridfs';
import Room from '../models/Room';

/**
 * Get splat file for a room
 */
export const getSplatFile = async (req: Request, res: Response) => {
    try {
        const { roomId } = req.params;

        // Validate roomId
        if (!roomId || !Types.ObjectId.isValid(roomId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid room ID provided',
            });
        }

        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found',
            });
        }

        if (!room.viewSplatFileId) {
            return res.status(404).json({
                success: false,
                error: 'No splat file found for this room',
            });
        }

        const bucket = getGridFSBucket();

        // Stream the file from GridFS
        const downloadStream = bucket.openDownloadStream(room.viewSplatFileId);

        downloadStream.on('error', (error) => {
            console.error('Error streaming splat file:', error);
            if (!res.headersSent) {
                res.status(404).json({
                    success: false,
                    error: 'Splat file not found in storage',
                });
            }
        });

        // Set headers for file download
        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="splat_${roomId}.splat"`,
        });

        downloadStream.pipe(res);
    } catch (error) {
        console.error('Error getting splat file:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    }
};
