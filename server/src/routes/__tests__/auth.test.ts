import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../app';

const TEST_SECRET = 'test-jwt-secret';

beforeAll(() => {
  vi.stubEnv('JWT_SECRET', TEST_SECRET);
});

afterAll(() => {
  vi.unstubAllEnvs();
});

const app = createApp();

describe('POST /api/auth/login', () => {
  it('returns 400 when username or password missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Username and password required');
  });

  it('returns 401 for wrong username', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'wrong', password: 'test' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });
});

describe('POST /api/auth/verify', () => {
  it('returns valid for a good token', async () => {
    const token = jwt.sign({ username: 'admin' }, TEST_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .post('/api/auth/verify')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ valid: true, username: 'admin' });
  });

  it('returns 401 for no token', async () => {
    const res = await request(app)
      .post('/api/auth/verify');

    expect(res.status).toBe(401);
  });

  it('returns 401 for invalid token', async () => {
    const res = await request(app)
      .post('/api/auth/verify')
      .set('Authorization', 'Bearer bad-token');

    expect(res.status).toBe(401);
  });
});

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('Admin routes require auth', () => {
  it('returns 401 for unauthenticated admin request', async () => {
    const res = await request(app).get('/api/admin/holdings');
    expect(res.status).toBe(401);
  });

  it('allows authenticated admin request', async () => {
    const token = jwt.sign({ username: 'admin' }, TEST_SECRET, { expiresIn: '1h' });
    const res = await request(app)
      .get('/api/admin/holdings')
      .set('Authorization', `Bearer ${token}`);

    // Should not be 401 — could be 200 or other status depending on data
    expect(res.status).not.toBe(401);
  });
});
