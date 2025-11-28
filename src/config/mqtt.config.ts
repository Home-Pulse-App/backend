
const mqttConfig = {
  brokerUrl: process.env.MQTT_URL || 'mqtt://localhost',
  options: {
    clientId: `express-server_1`,
    username: process.env.MQTT_USERNAME || undefined,
    password: process.env.MQTT_PASSWORD || undefined,
    clean: true,
    reconnectPeriod: 3000,   // reconecta cada 1 segundos
    connectTimeout: 30 * 1000,
    keepalive: 60,
  }
};

export default mqttConfig;