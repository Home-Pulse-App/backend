import client from '../utils/mqtt';
import { subscribedTopics } from '../utils/mqtt.subscribes';
import DeviceData, {IDeviceData} from '../models/DeviceData';


client.on('message', async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());

    // Topic example: devices/1/temperature
    const [, deviceId, sensor] = topic.split('/');

    await Reading.create({
      deviceId: Number(deviceId),
      sensor,
      value: payload.value,
    });

    console.log(`💾 Saved reading from device ${deviceId} (${sensor})`);
  } catch (err) {
    console.error('❌ Failed to store reading:', err);
  }
});