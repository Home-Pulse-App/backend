import { IDevice } from '../models/Device';
import mqtt from './mqtt';

export const subscribedTopics = new Set<string>();

export function subscribeToDevices(devices: Array<IDevice>) {
  if (devices) {
    devices.forEach((device) => {
      console.log(device);
      const deviceTopic = `${device.type}/${device.deviceName}/data`;
      mqtt.subscribe(deviceTopic);
      subscribedTopics.add(deviceTopic);
    });
  }
};

export function subscribeToDevice(device: IDevice) {
      console.log(device);
      const deviceTopic = `${device.type}/${device.deviceName}/data`;
      mqtt.subscribe(deviceTopic);
      subscribedTopics.add(deviceTopic);
};