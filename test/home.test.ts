import request from 'supertest';
import { test, vi, describe, beforeAll, afterAll, expect } from 'vitest';
import { app } from '../src/server';
import * as http from 'http';
import Home from '../src/models/Home';
import User from '../src/models/User';
import Room from '../src/models/Room';
import Device from '../src/models/Device';
import jwt from 'jsonwebtoken';

// Mock dependencies
vi.mock('../src/models/Home');
vi.mock('../src/models/User');
vi.mock('../src/models/Room');
vi.mock('../src/models/Device');
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

describe('Home Routes', () => {
  const mockUser = {
    _id: 'user123',
    homes: [],
    save: vi.fn(),
  };

  const mockHome = {
    _id: 'home123',
    userId: 'user123',
    homeName: 'Test Home',
    rooms: [],
    save: vi.fn(),
  };

  describe('POST /api/homes', () => {
    test('Create new home - Success', async () => {
      (Home.create as any).mockResolvedValue(mockHome);
      (User.findByIdAndUpdate as any).mockResolvedValue(mockUser);

      const response = await request(server)
        .post('/api/homes')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          homeName: 'Test Home',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Home created successfully');
    });

    test('Create new home - Validation Error', async () => {
      const response = await request(server)
        .post('/api/homes')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          // Missing homeName
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Home Name is required');
    });
  });

  describe('GET /api/homes', () => {
    test('Get user homes - Success', async () => {
      (User.findById as any).mockReturnValue({
        populate: vi.fn().mockResolvedValue({
          ...mockUser,
          homes: [mockHome],
        }),
      });

      const response = await request(server)
        .get('/api/homes')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.homes).toHaveLength(1);
    });
  });

  describe('DELETE /api/homes/:homeId', () => {
    test('Delete home - Success', async () => {
      (User.findById as any).mockResolvedValue({
        ...mockUser,
        homes: ['home123'],
      });
      (Home.findById as any).mockResolvedValue(mockHome);
      (Room.find as any).mockResolvedValue([]);
      (Home.findByIdAndDelete as any).mockResolvedValue(mockHome);

      const response = await request(server)
        .delete('/api/homes/home123')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Home and all rooms deleted, devices disconnected');
    });
  });
});
