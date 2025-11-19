import { Request, Response } from 'express';
import prisma from '../config/prismaClient';
import bcrypt from 'bcrypt';
import { cloudinaryUpload } from '../utils/cloudinary';

/**
 * GET /me
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PUT /me
 * Update profile (name, email, phone, profile picture)
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    // Basic validation (keep minimal here) - ensure at least one field provided
    if (!req.body.name && !req.body.email && !req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'No data to update' });
    }

    let profileImageUrl: string | undefined = undefined;

    if (req.file) {
      const uploaded = await cloudinaryUpload(
        req.file as Express.Multer.File,
        'profile-pictures'
      );
      profileImageUrl = uploaded.secure_url;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: (req.body.name as string) || undefined,
        email: (req.body.email as string) || undefined,
        ...(profileImageUrl ? { profilePhoto: profileImageUrl } : {}),
      },
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PUT /me/change-password
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid new password' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
