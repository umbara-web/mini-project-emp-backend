"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const cloudinary_1 = require("../utils/cloudinary");
/**
 * GET /me
 * Get current user profile
 */
const getProfile = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const user = await prismaClient_1.default.user.findUnique({ where: { id: userId } });
        return res.json({ success: true, data: user });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getProfile = getProfile;
/**
 * PUT /me
 * Update profile (name, email, phone, profile picture)
 */
const updateProfile = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Basic validation (keep minimal here) - ensure at least one field provided
        if (!req.body.name && !req.body.email && !req.file) {
            return res
                .status(400)
                .json({ success: false, message: 'No data to update' });
        }
        let profileImageUrl = undefined;
        if (req.file) {
            const uploaded = await (0, cloudinary_1.cloudinaryUpload)(req.file, 'profile-pictures');
            profileImageUrl = uploaded.secure_url;
        }
        const updated = await prismaClient_1.default.user.update({
            where: { id: userId },
            data: Object.assign({ name: req.body.name || undefined, email: req.body.email || undefined }, (profileImageUrl ? { profilePhoto: profileImageUrl } : {})),
        });
        return res.json({ success: true, data: updated });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateProfile = updateProfile;
/**
 * PUT /me/change-password
 */
const changePassword = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid new password' });
        }
        const hashed = await bcrypt_1.default.hash(newPassword, 10);
        await prismaClient_1.default.user.update({
            where: { id: userId },
            data: { password: hashed },
        });
        return res.json({
            success: true,
            message: 'Password updated successfully',
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.changePassword = changePassword;
