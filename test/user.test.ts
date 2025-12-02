import request from 'supertest';
import { test, vi, describe, beforeAll, afterAll, expect } from 'vitest';
import { app } from '../src/server';
import * as http from 'http';
import User from '../src/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
vi.mock('../src/models/User');
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');
vi.mock('../src/utils/mqtt.subscribes', () => ({
  subscribeToDevices: vi.fn(),
}));

// Mock mongoose connect
vi.mock('mongoose', async () => {
  const actual = await vi.importActual('mongoose');
  return {
    ...actual,
    connect: vi.fn(),
  };
});

// Mock mqtt manager
vi.mock('../src/utils/mqtt', () => ({
  default: {
    reconnect: vi.fn(),
  },
}));

let server: http.Server;
let mockToken: string;

beforeAll(() => {
  server = app.listen();
  // Create a valid token for authenticated routes
  mockToken = 'valid-token';
  (jwt.verify as any).mockReturnValue({ id: 'user123', email: 'test@example.com' });
});

afterAll(() => {
  server.close();
});

describe('User Routes', () => {
  const mockUser = {
    _id: 'user123',
    userName: 'Test User',
    email: 'test@example.com',
    passwordHash: 'hashedPassword',
    save: vi.fn(),
  };

  describe('POST /api/users', () => {
    test('Create new user - Success', async () => {
      (User.prototype.save as any).mockResolvedValue(mockUser);
      (bcrypt.hash as any).mockResolvedValue('hashedPassword');

      const response = await request(server)
        .post('/api/users')
        .send({
          userName: 'Test User',
          email: 'new@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
    });

    test('Create new user - Validation Error', async () => {
      const response = await request(server)
        .post('/api/users')
        .send({
          // Missing required fields
          email: 'invalid-email',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('PUT /api/users', () => {
    test('Update user - Success', async () => {
      (User.findById as any).mockResolvedValue(mockUser);
      
      const response = await request(server)
        .put('/api/users')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          userName: 'Updated Name',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User updated successfully');
    });
  });

  describe('DELETE /api/users', () => {
    test('Delete user - Success', async () => {
      (User.deleteOne as any).mockResolvedValue({ deletedCount: 1 });

      const response = await request(server)
        .delete('/api/users')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully');
    });
  });
});
