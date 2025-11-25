
const mqttConfig = {
  brokerUrl: 'mqtt://broker.emqx.io',
  options: {
    clientId: `express-server_1`,
    username: process.env.MQTT_USERNAME || undefined,
    password: process.env.MQTT_PASSWORD || undefined,
    clean: true,
    reconnectPeriod: 5000,   // reconecta cada 5 segundos
    connectTimeout: 30 * 1000,
    keepalive: 60,
  }
};

export default mqttConfig;