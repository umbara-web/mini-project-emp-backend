"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_1 = __importDefault(require("multer"));
// Multer for profile image upload
const upload = (0, multer_1.default)({ dest: 'uploads/' });
const router = (0, express_1.Router)();
// All user routes require authentication
router.use(auth_middleware_1.authenticate);
// GET /users/me
router.get('/me', userController_1.getProfile);
// PUT /users/me (with optional profile image)
router.put('/me', upload.single('profileImage'), userController_1.updateProfile);
// PUT /users/me/change-password
router.put('/me/change-password', userController_1.changePassword);
exports.default = router;
