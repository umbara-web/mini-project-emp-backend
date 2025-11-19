// Mock nanoid (ESM package) and auth middleware before importing app
jest.mock('nanoid', () => ({ nanoid: () => 'TESTCODE' }));
// Mock auth middleware before importing app
jest.mock('../src/middlewares/auth.middleware', () => ({
  authenticate: (
    req: import('express').Request & { user?: Record<string, unknown> },
    _res: import('express').Response,
    next: import('express').NextFunction
  ) => {
    req.user = {
      id: 'user_1',
      name: 'User',
      email: 'user@example.com',
      password: '',
      role: 'CUSTOMER',
      referenceCode: 'REF-USER',
      referredById: null,
      pointsBalance: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      profilePhoto: null,
    };
    next();
  },
  authorizeOrganizer: (
    _req: import('express').Request & { user?: Record<string, unknown> },
    _res: import('express').Response,
    next: import('express').NextFunction
  ) => next(),
}));

// Mock prisma client
jest.mock('../src/config/prismaClient', () => ({
  __esModule: true,
  default: {
    $transaction: jest.fn(),
    event: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    coupon: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/prismaClient';

describe('Transaction endpoints', () => {
  afterEach(() => jest.clearAllMocks());

  test('creates a transaction (purchase)', async () => {
    const mockEvent = {
      id: 'event_1',
      title: 'E',
      seatsLeft: 10,
      price: 10000,
    };

    const txMock = {
      event: {
        findUnique: jest.fn().mockResolvedValue(mockEvent),
        update: jest.fn().mockResolvedValue({}),
      },
      coupon: {
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn().mockResolvedValue({}),
      },
      transaction: {
        create: jest.fn().mockResolvedValue({ id: 'trx_1', amount: 10000 }),
      },
    };

    (prisma.$transaction as jest.Mock).mockImplementation(
      async (cb: (tx: typeof txMock) => Promise<any>) => cb(txMock as any)
    );

    const res = await request(app)
      .post('/api/transactions')
      .send({ eventId: 'event_1', quantity: 1 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('transaction');
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  test('fails when not enough seats', async () => {
    const mockEvent = {
      id: 'event_2',
      title: 'E2',
      seatsLeft: 0,
      price: 15000,
    };

    const txMock = {
      event: {
        findUnique: jest.fn().mockResolvedValue(mockEvent),
        update: jest.fn().mockResolvedValue({}),
      },
      coupon: {
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn().mockResolvedValue({}),
      },
      transaction: {
        create: jest.fn(),
      },
    };

    (prisma.$transaction as jest.Mock).mockImplementation(
      async (cb: (tx: typeof txMock) => Promise<any>) => cb(txMock as any)
    );

    const res = await request(app)
      .post('/api/transactions')
      .send({ eventId: 'event_2', quantity: 1 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect((res.body.error as string).toLowerCase()).toContain(
      'not enough seats'
    );
  });

  test('fails when coupon is invalid', async () => {
    const mockEvent = {
      id: 'event_3',
      title: 'E3',
      seatsLeft: 5,
      price: 20000,
    };

    const invalidCoupon = {
      id: 'c1',
      code: 'BAD',
      discount: 10,
      used: true,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    } as unknown as Record<string, unknown>;

    const txMock = {
      event: {
        findUnique: jest.fn().mockResolvedValue(mockEvent),
        update: jest.fn().mockResolvedValue({}),
      },
      coupon: {
        findUnique: jest.fn().mockResolvedValue(invalidCoupon),
        update: jest.fn().mockResolvedValue({}),
      },
      transaction: {
        create: jest.fn(),
      },
    };

    (prisma.$transaction as jest.Mock).mockImplementation(
      async (cb: (tx: typeof txMock) => Promise<any>) => cb(txMock as any)
    );

    const res = await request(app)
      .post('/api/transactions')
      .send({ eventId: 'event_3', quantity: 1, couponCode: 'BAD' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect((res.body.error as string).toLowerCase()).toContain(
      'invalid coupon'
    );
  });
});
