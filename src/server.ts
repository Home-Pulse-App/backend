import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import router from './routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.config';
import connectDB from './db';

export const app = express();

if (process.env.NODE_ENV !== 'test') {
  connectDB();
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