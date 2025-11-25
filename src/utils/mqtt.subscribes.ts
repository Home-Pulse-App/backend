import { IDevice } from '../modules/Device';
import mqtt from './mqtt';

export function subscribeToDevices (devices: Array<IDevice>) {
  if (devices) {
    devices.forEach(device => {
      console.log(device);
      const deviceTopic = `${device.type}/${device.deviceName}/data`;
      mqtt.subscribe(deviceTopic);
    })
  }
}