import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import router from './routes/index';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.config';
import connectDB from './db';
import mqttManager from './utils/mqtt';

export const app = express();

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    // Initialize GridFS after DB connection
    const { initGridFS } = require('./utils/gridfs');
    initGridFS();
    console.log('GridFS initialized');
  });
  mqttManager.reconnect();
}

app.use(cors());
app.use(express.json({ limit: '250mb' })); // Increased limit for base64 splat files
app.use(express.urlencoded({ limit: '250mb', extended: true }));

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
