import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import router from './routes/index';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.config';
import connectDB from './db';
import mqttClient from './utils/mqtt';

export const app = express();

if (process.env.NODE_ENV !== 'test') {
  connectDB();
  mqttClient.connect();
}

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(router);

const port = 3000;

async function startServer() {
  try {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}.🏃`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();
