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
      id: 'org_1',
      name: 'Organizer',
      email: 'org@example.com',
      password: '',
      role: 'ORGANIZER',
      referenceCode: 'REF-ORG',
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
    event: {
      create: jest.fn(),
    },
  },
}));

import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/prismaClient';

describe('Event endpoints', () => {
  afterEach(() => jest.clearAllMocks());

  test('creates an event (organizer)', async () => {
    const mockEvent = {
      id: 'event_1',
      title: 'My Event',
      description: 'desc',
      capacity: 100,
      seatsLeft: 100,
      price: 50000,
      startAt: new Date().toISOString(),
      endAt: null,
      ownerId: 'org_1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.event.create as jest.Mock).mockResolvedValue(mockEvent);

    const res = await request(app).post('/api/events').send({
      title: 'My Event',
      description: 'desc',
      capacity: 100,
      price: 50000,
      startAt: new Date().toISOString(),
    });

    expect(res.status).toBe(200);
    // body will have date strings — assert key fields
    expect(res.body).toHaveProperty('id', 'event_1');
    expect(res.body).toMatchObject({
      title: 'My Event',
      description: 'desc',
      capacity: 100,
      seatsLeft: 100,
      price: 50000,
      ownerId: 'org_1',
    });
    expect(prisma.event.create).toHaveBeenCalled();
  });
});
