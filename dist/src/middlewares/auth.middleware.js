"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeCustomer = exports.authorizeOrganizer = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * AUTHENTICATE MIDDLEWARE
 * Verifies JWT token and attaches user to req.user
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await prismaClient_1.default.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            return res
                .status(401)
                .json({ success: false, message: 'Invalid token user' });
        }
        // Attach full user object to request (matches Request.user type)
        req.user = user;
        return next();
    }
    catch (err) {
        return res
            .status(401)
            .json({ success: false, message: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
/**
 * AUTHORIZE ORGANIZER
 * Allows only organizers to continue
 */
const authorizeOrganizer = (req, res, next) => {
    if (!req.user || req.user.role !== 'ORGANIZER') {
        return res
            .status(403)
            .json({ success: false, message: 'Access denied: organizer only' });
    }
    return next();
};
exports.authorizeOrganizer = authorizeOrganizer;
/**
 * AUTHORIZE CUSTOMER
 * Allows only customers to continue
 */
const authorizeCustomer = (req, res, next) => {
    if (!req.user || req.user.role !== 'CUSTOMER') {
        return res
            .status(403)
            .json({ success: false, message: 'Access denied: customer only' });
    }
    return next();
};
exports.authorizeCustomer = authorizeCustomer;
