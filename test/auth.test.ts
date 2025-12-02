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

// Mock mongoose connect to avoid actual DB connection during tests if server.ts tries to connect
vi.mock('mongoose', async () => {
  const actual = await vi.importActual('mongoose');
  return {
    ...actual,
    connect: vi.fn(),
  };
});

// Mock mqtt manager to avoid connection attempts
vi.mock('../src/utils/mqtt', () => ({
  default: {
    reconnect: vi.fn(),
  },
}));


let server: http.Server;

beforeAll(() => {
  server = app.listen();
});

afterAll(() => {
  server.close();
});

describe('Auth Routes', () => {
  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    passwordHash: 'hashedPassword',
    devices: [],
    populate: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue({
        _id: 'user123',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        devices: []
    }),
  };

  test('POST /api/auth/login - Success', async () => {
    // Setup mocks
    (User.findOne as any).mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue(mockUser),
    });
    (bcrypt.compare as any).mockResolvedValue(true);
    (jwt.sign as any).mockReturnValue('mock-token');

    const response = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ token: 'mock-token' });
  });

  test('POST /api/auth/login - Invalid Email', async () => {
    // Setup mocks
    (User.findOne as any).mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue(null),
    });

    const response = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid credentials' });
  });

  test('POST /api/auth/login - Invalid Password', async () => {
    // Setup mocks
    (User.findOne as any).mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue(mockUser),
    });
    (bcrypt.compare as any).mockResolvedValue(false);

    const response = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid credentials' });
  });
});
