// src/utils/mqtt.subscribes.ts
import { IDevice } from '../models/Device';
import mqttManager from './mqtt';

/**
 * Subscribe to multiple devices
 */
export async function subscribeToDevices(devices: Array<IDevice>): Promise<void> {
  if (!devices || devices.length === 0) {
    console.log('ℹ️ there are not devices to subscribe');
    return;
  }

  console.log(`📡 Subscribing on ${devices.length} device(s)...`);

  const subscriptionPromises = devices.map(device => subscribeToDevice(device));
  
  try {
    await Promise.all(subscriptionPromises);
    console.log(`✅ Subscription done for ${devices.length} device(s)`);
  } catch (error) {
    console.error('❌ Error on subscription to devices:', error);
  }
}

/**
 * Subscribe to a single device
 */
export async function subscribeToDevice(device: IDevice): Promise<void> {
  const deviceTopic = `${device.type}/${device.deviceName}/data`;
  
  try {
    await mqttManager.subscribe(deviceTopic, 1);
    console.log(`✅ Device ${device.deviceName} subscribed correctly`);
  } catch (error) {
    console.error(`❌ Error on subscribe device ${device.deviceName}:`, error);
    throw error;
  }
}

/**
 * Unsubscribe from a device
 */
export async function unsubscribeFromDevice(device: IDevice): Promise<void> {
  const deviceTopic = `${device.type}/${device.deviceName}/data`;
  
  try {
    await mqttManager.unsubscribe(deviceTopic);
    console.log(`✅ Device ${device.deviceName} unsubscribed correct`);
  } catch (error) {
    console.error(`❌ Error on unsubscribe device ${device.deviceName}:`, error);
    throw error;
  }
}

/**
 * Get all active device subscriptions
 */
export function getActiveSubscriptions(): string[] {
  return mqttManager.getSubscriptions();
}