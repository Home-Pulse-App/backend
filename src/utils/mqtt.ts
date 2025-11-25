import mqtt from 'mqtt';
import mqttConfig  from '../config/mqtt.config';

const client = mqtt.connect(mqttConfig.brokerUrl, mqttConfig.options);

client.on('connect', () => {
  console.log('✅ MQTT conectado a', mqttConfig.brokerUrl);
});

client.on('error', (err) => {
  console.error('❌ Error MQTT:', err);
});

client.on('offline', () => {
  console.warn('MQTT desconectado');
});

client.on('reconnect', () => {
  console.log('Reconectando MQTT...');
});

export default client;