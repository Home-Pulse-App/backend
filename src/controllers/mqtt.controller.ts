import client from '../utils/mqtt';
import { subscribedTopics } from '../utils/mqtt.subscribes';
import DeviceData, {IDeviceData} from '../models/DeviceData';



client.on('message', async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    console.log(payload);

    // esp32-generic/iot1/data
    const [deviceType, deviceId, data] = topic.split('/');
    
    const newData = await DeviceData.create({
      userId,
      deviceId,
      data
    });
    
    console.log(`💾 Saved readings for ${deviceId}`);
  } catch (err) {
    console.error('❌ Failed to store reading:', err);
  }
});