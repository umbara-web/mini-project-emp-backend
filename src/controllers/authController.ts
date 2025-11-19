import { Request, Response } from 'express';
import prisma from '../config/prismaClient';
import bcrypt, { genSalt, hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { registerSchema, loginSchema } from '../validations/authSchemas';
import { createReferralOnSignup } from '../services/referralService';

export const register = async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing)
    return res.status(400).json({ error: 'Email already registered' });

  const salt = await genSalt(10);
  const hashedPassword = await hash(data.password, salt);
  const referenceCode = `REF-${nanoid(8).toUpperCase()}`;

  const created = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      referenceCode,
      referredById: null,
      ...(data.role ? { role: data.role } : {}),
    },
  });

  if (data.referenceCode) {
    await createReferralOnSignup(created.id, data.referenceCode);
  }

  const token = jwt.sign(
    { id: created.id, role: created.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );
  res.json({
    token,
    user: {
      id: created.id,
      email: created.email,
      referenceCode: created.referenceCode,
    },
  });
};

export const login = async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(data.password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '30d' }
  );
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      referenceCode: user.referenceCode,
    },
  });
};

export const forgotPassword = async (req: Request, res: Response) => {
  // Minimal: generate token & send email via mailer.ts
  res.json({
    ok: true,
    message: 'If your email exists, you will receive a reset link',
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  // Validate token & reset password
  res.json({ ok: true });
};
