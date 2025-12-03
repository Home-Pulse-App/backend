import request from 'supertest';
import { test, vi, describe, beforeAll, afterAll, expect } from 'vitest';
import { app } from '../src/server';
import * as http from 'http';
import Device from '../src/models/Device';
import User from '../src/models/User';
import jwt from 'jsonwebtoken';

// Mock dependencies
vi.mock('../src/models/Device');
vi.mock('../src/models/User');
vi.mock('jsonwebtoken');
vi.mock('../src/utils/mqtt.subscribes', () => ({
  subscribeToDevice: vi.fn(),
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

describe('Device Routes', () => {
  const mockUser = {
    _id: 'user123',
    devices: [],
    save: vi.fn(),
  };

  const mockDevice = {
    _id: 'device123',
    userId: 'user123',
    deviceName: 'Test Device',
    type: 'sensor',
    state: 'OFFLINE',
    save: vi.fn(),
  };

  describe('POST /api/devices', () => {
    test('Create new device - Success', async () => {
      (User.findById as any).mockResolvedValue(mockUser);
      (Device.findOne as any).mockResolvedValue(null);
      (Device.prototype.save as any).mockResolvedValue(mockDevice);
      (User.findByIdAndUpdate as any).mockResolvedValue(mockUser);

      const response = await request(server)
        .post('/api/devices')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          deviceName: 'Test Device',
          type: 'sensor',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Device registered successfully');
    });

    test('Create new device - Validation Error', async () => {
      const response = await request(server)
        .post('/api/devices')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          // Missing required fields
          type: 'sensor',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/devices', () => {
    test('Get all devices - Success', async () => {
      (User.findById as any).mockReturnValue({
        populate: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue({
            ...mockUser,
            devices: [mockDevice],
          }),
        }),
      });

      const response = await request(server)
        .get('/api/devices')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.devices).toHaveLength(1);
    });
  });
});
