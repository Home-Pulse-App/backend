import request from 'supertest';
import { test, describe, beforeAll, afterAll, beforeEach, expect } from 'vitest';
import { app } from '../../src/server';
import * as http from 'http';
import { connect, closeDatabase, clearDatabase } from '../setup';

let server: http.Server;

beforeAll(async () => {
  await connect();
  server = app.listen();
});

afterAll(async () => {
  server.close();
  await closeDatabase();
});

beforeEach(async () => {
  await clearDatabase();
});

describe('Integration Test - Full User Flow', () => {
  test('Complete user journey: Register -> Login -> Create Home -> Add Room -> Add Device -> Connect Device', async () => {
    // Step 1: Register a new user
    const registerResponse = await request(server)
      .post('/api/users')
      .send({
        userName: 'Integration Test User',
        email: 'integration@test.com',
        password: 'Password123!',
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.success).toBe(true);

    // Step 2: Login to get token
    const loginResponse = await request(server)
      .post('/api/auth/login')
      .send({
        email: 'integration@test.com',
        password: 'Password123!',
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.ResponseData.token).toBeDefined();
    const token = loginResponse.body.ResponseData.token;

    // Step 3: Create a new home
    const homeResponse = await request(server)
      .post('/api/homes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        homeName: 'Test Home',
      });

    expect(homeResponse.status).toBe(201);
    expect(homeResponse.body.home).toBeDefined();
    const homeId = homeResponse.body.home._id;

    // Step 4: Add a room to the home
    const roomResponse = await request(server)
      .post(`/api/homes/${homeId}/rooms`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        roomName: 'Living Room',
      });

    expect(roomResponse.status).toBe(201);
    expect(roomResponse.body.room).toBeDefined();
    const roomId = roomResponse.body.room._id;

    // Step 5: Register a new device
    const deviceResponse = await request(server)
      .post('/api/devices')
      .set('Authorization', `Bearer ${token}`)
      .send({
        deviceName: 'Temperature Sensor',
        type: 'esp32-generic',
        sensors: ['temperature', 'humidity'],
      });

    expect(deviceResponse.status).toBe(201);
    expect(deviceResponse.body.data.device).toBeDefined();
    const deviceId = deviceResponse.body.data.device._id;

    // Step 6: Connect device to room
    const connectResponse = await request(server)
      .post(`/api/homes/${homeId}/rooms/${roomId}/connect/${deviceId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(connectResponse.status).toBe(200);
    expect(connectResponse.body.message).toBe('Device connected successfully');

    // Step 7: Verify the final state - Get home with rooms
    const verifyHomeResponse = await request(server)
      .get(`/api/homes/${homeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(verifyHomeResponse.status).toBe(200);
    expect(verifyHomeResponse.body.home.rooms).toHaveLength(1);

    // Step 8: Verify room has device
    const verifyRoomResponse = await request(server)
      .get(`/api/homes/${homeId}/rooms/${roomId}/devices`)
      .set('Authorization', `Bearer ${token}`);

    expect(verifyRoomResponse.status).toBe(200);
    expect(verifyRoomResponse.body.data.devices).toHaveLength(1);
    expect(verifyRoomResponse.body.data.devices[0]._id).toBe(deviceId);
  });
});
