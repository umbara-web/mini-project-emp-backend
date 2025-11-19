import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
} from '../controllers/userController';
import { authenticate } from '../middlewares/auth.middleware';
import multer from 'multer';

// Multer for profile image upload
const upload = multer({ dest: 'uploads/' });

const router = Router();

// All user routes require authentication
router.use(authenticate);

// GET /users/me
router.get('/me', getProfile);

// PUT /users/me (with optional profile image)
router.put('/me', upload.single('profileImage'), updateProfile);

// PUT /users/me/change-password
router.put('/me/change-password', changePassword);

export default router;
