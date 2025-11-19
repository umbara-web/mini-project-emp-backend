import { Request, Response } from 'express';
import prisma from '../config/prismaClient';
import { Prisma } from '@prisma/client';

export const createEvent = async (req: Request, res: Response) => {
  const { title, description, capacity, price, startAt, endAt } = req.body;
  const event = await prisma.event.create({
    data: {
      title,
      description,
      capacity,
      seatsLeft: capacity,
      price: Number(price),
      startAt: new Date(startAt),
      endAt: endAt ? new Date(endAt) : null,
      ownerId: req.user!.id,
    },
  });
  res.json(event);
};

export const updateEvent = async (req: Request, res: Response) => {
  const id = req.params.id;
  const data = req.body;
  const updated = await prisma.event.update({ where: { id }, data });
  res.json(updated);
};

export const listMyEvents = async (req: Request, res: Response) => {
  const items = await prisma.event.findMany({
    where: { ownerId: req.user!.id },
  });
  res.json({ items });
};

export const searchEvents = async (req: Request, res: Response) => {
  const q = (req.query.q as string) || '';
  const page = Number(req.query.page || '1');
  const pageSize = Math.min(Number(req.query.pageSize || '10'), 50);
  const where = q
    ? { title: { contains: q, mode: 'insensitive' as Prisma.QueryMode } }
    : {};
  const [items, total] = await prisma.$transaction([
    prisma.event.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.event.count({ where }),
  ]);
  if (!items.length)
    return res.json({ items: [], total, message: 'No events found' });
  res.json({ items, total });
};
