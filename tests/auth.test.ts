// Mock nanoid (ESM package) before importing app so Jest doesn't try to parse ESM module
jest.mock('nanoid', () => ({ nanoid: () => 'TESTCODE' }));

import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../src/app';

// Mock prisma client
jest.mock('../src/config/prismaClient', () => {
  return {
    __esModule: true,
    default: {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      pointTransaction: {
        create: jest.fn(),
      },
      coupon: {
        create: jest.fn(),
      },
    },
  };
});

import prisma from '../src/config/prismaClient';

describe('Auth flow', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('registers a new user', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockImplementation(async ({ data }) => ({
      id: 'user_1',
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role || 'CUSTOMER',
      referenceCode: data.referenceCode,
    }));

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({ email: 'test@example.com' });
  });

  test('logs in an existing user', async () => {
    const hashed = await bcrypt.hash('password123', 10);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user_1',
      email: 'test@example.com',
      password: hashed,
      role: 'CUSTOMER',
      referenceCode: 'REF-TEST',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({ email: 'test@example.com' });
  });
});
