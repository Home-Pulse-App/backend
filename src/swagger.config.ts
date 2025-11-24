// backend/swagger.config.ts

import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Home Pulse API Documentation',
      version: '1.0.0',
      description: 'API for managing devices and monitoring the Home Pulse system.',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
      },
    ],
    // Security definition (for JWT)
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter the JWT token to access protected routes.',
        },
      },
    },
  },

  apis: ['./src/routes/*.ts', './src/models/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
