import request from 'supertest';
import { test, vi, describe, beforeAll, afterAll } from 'vitest';

import { app } from '../src/server';
import * as http from 'http';

let server: http.Server;

beforeAll(() => {
  server = app.listen();
});

afterAll(() => {
  server.close();
});

test('Server connected', async ({ expect }) => {
  const response = await request(server).get('/api');

  expect(response.statusCode).toBe(200);
  expect(response.text).toBe('It is alive! 🧟');
});
