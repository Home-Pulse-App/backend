import express from 'express';
import cors from 'cors';
import router from './router';

export const app = express();
app.use(cors());
app.use(express.json());
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
