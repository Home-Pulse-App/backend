// src/utils/mqtt.ts
import mqtt, { MqttClient } from 'mqtt';
import mqttConfig from '../config/mqtt.config';
import User from '../models/User';
import DeviceData from '../models/DeviceData';
import Device from '../models/Device';

class MQTTManager {
  public client: MqttClient;
  private subscriptions = new Map<string, { qos: 0 | 1 | 2 }>();
  public isReconnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 30;

  constructor() {
    this.client = mqtt.connect(mqttConfig.brokerUrl, mqttConfig.options);
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('connect', () => {
      console.log('✅ MQTT connected to', mqttConfig.brokerUrl);
      this.reconnectAttempts = 0;
      this.isReconnecting = false;

      this.resubscribeAll();
    });

    this.client.on('error', (err) => {
      console.error('❌ Error MQTT:', err.message);
    });

    this.client.on('offline', () => {
      console.warn('📴 MQTT offline');
      this.isReconnecting = true;
    });

    this.client.on('reconnect', () => {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnecting MQTT... (try ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max number reconnections reached');
        this.client.end();
        // this.reconnectAttempts = 0;
        // this.client.connect();
      }
    });

    this.client.on('close', () => {
      console.warn('🔌 MQTT connection closed');
    });

    this.client.on('message', async (topic, message) => {
      await this.handleMessage(topic, message);
    });
  }

  private async handleMessage(topic: string, message: Buffer) {
    try {
      const payload = JSON.parse(message.toString());

      console.log('📨 Mensage on:', { topic, payload });

      if (payload.light > 100) {
        payload.light = 100;
      };
      // esp32-generic/iot1/data
      const topicParts = topic.split('/');

      if (topicParts.length < 2) {
        console.error('❌ Wrong topic:', topic);
        return;
      };

      const [type, deviceName] = topicParts;
      // console.log('📱 Device:', deviceName);

      const device = await Device.findOne({ deviceName: deviceName });
      if (!device) {
        console.log(`❌ Device '${deviceName}' is not on the DB`);
        return;
      };

      const user = await User.findOne({ devices: device._id as any });

      if (!user) {
        console.log(`❌ Not user for '${deviceName}'`);
        return;
      };
      // console.log('device:',device);
      // console.log('user:',user);

      const newData = new DeviceData({
        userId: user._id,
        deviceId: device._id,
        sensorsData: payload
      });

      console.log('newDAta:', newData);

      await newData.save();
      console.log(`💾 Datos saved ${deviceName}`);

    } catch (err) {
      console.error('❌ Error on the message:', err);
    }
  }

  public subscribe(topic: string, qos: 0 | 1 | 2 = 1): Promise<void> {
    return new Promise((resolve, reject) => {

      this.subscriptions.set(topic, { qos });

      if (!this.client.connected || this.client.disconnecting) {
        console.log(`⏳ Subscription on line (no connected): ${topic}`);

        resolve();
        return;
      }

      this.client.subscribe(topic, { qos }, (err) => {
        if (err) {
          console.error(`❌ Error subscribing to ${topic}:`, err.message);
          reject(err);
        } else {
          console.log(`✅ Subscribed to ${topic} (QoS: ${qos})`);
          resolve();
        }
      });
    });
  }

  public unsubscribe(topic: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.subscriptions.delete(topic);

      if (!this.client.connected) {
        console.log(`⚠️ No connected, removing subscription from line: ${topic}`);
        resolve();
        return;
      }

      this.client.unsubscribe(topic, (err) => {
        if (err) {
          console.error(`❌ Error to subscribe from ${topic}:`, err.message);
          reject(err);
        } else {
          console.log(`✅ Unsuscribed from ${topic}`);
          resolve();
        }
      });
    });
  }

  private resubscribeAll() {
    if (this.subscriptions.size === 0) {
      console.log('ℹ️ No subscriptions to restore');
      return;
    }

    console.log(`🔄 Re-subscribing to ${this.subscriptions.size} topic(s)...`);

    this.subscriptions.forEach((config, topic) => {
      this.client.subscribe(topic, { qos: config.qos }, (err) => {
        if (err) {
          console.error(`❌ Error on re-subscribing to ${topic}:`, err.message);
        } else {
          console.log(`✅ Re-subscribed to ${topic}`);
        }
      });
    });
  }

  public publish(topic: string, message: string | Buffer, qos: 0 | 1 | 2 = 1): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client.connected) {
        reject(new Error('MQTT no connected'));
        return;
      }

      this.client.publish(topic, message, { qos }, (err) => {
        if (err) {
          console.error(`❌ Error to publish on ${topic}:`, err.message);
          reject(err);
        } else {
          console.log(`✅ Published to ${topic}`);
          resolve();
        }
      });
    });
  }

  public isConnected(): boolean {
    return this.client.connected;
  }

  public getSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  public reconnect() {
    if (!this.client.connected && !this.isReconnecting) {
      console.log('🔄 FForcing reconnection...');
      this.client.reconnect();
    }
  }

  public disconnect(): Promise<void> {
    return new Promise((resolve) => {
      this.subscriptions.clear();
      this.client.end(false, {}, () => {
        console.log('✅ Desconected from MQTT');
        resolve();
      });
    });
  }
}

export const mqttManager = new MQTTManager();
export default mqttManager;

// Example usage in your auth or device add routes:
/*
import { subscribeToDevice, subscribeToDevices } from './utils/mqtt.subscribes';

// When user logs in (auth route)
app.post('/auth/login', async (req, res) => {
  // ... authentication logic ...
  
  const user = await User.findById(userId).populate('devices');
  
  if (user && user.devices) {
    await subscribeToDevices(user.devices);
  }
  
  res.json({ success: true, user });
});

// When device is added
app.post('/devices', async (req, res) => {
  const newDevice = new Device(req.body);
  await newDevice.save();
  
  // Subscribe to the new device
  await subscribeToDevice(newDevice);
  
  res.json({ success: true, device: newDevice });
});

// When device is removed
app.delete('/devices/:id', async (req, res) => {
  const device = await Device.findById(req.params.id);
  
  if (device) {
    await unsubscribeFromDevice(device);
    await device.remove();
  }
  
  res.json({ success: true });
});
*/