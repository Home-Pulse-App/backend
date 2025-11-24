import express from 'express';
import cors from 'cors';
import router from './routes/users.routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.config';

export const app = express();

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