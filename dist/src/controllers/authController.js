"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.login = exports.register = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const bcrypt_1 = __importStar(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nanoid_1 = require("nanoid");
const authSchemas_1 = require("../validations/authSchemas");
const referralService_1 = require("../services/referralService");
const register = async (req, res) => {
    const data = authSchemas_1.registerSchema.parse(req.body);
    const existing = await prismaClient_1.default.user.findUnique({
        where: { email: data.email },
    });
    if (existing)
        return res.status(400).json({ error: 'Email already registered' });
    const salt = await (0, bcrypt_1.genSalt)(10);
    const hashedPassword = await (0, bcrypt_1.hash)(data.password, salt);
    const referenceCode = `REF-${(0, nanoid_1.nanoid)(8).toUpperCase()}`;
    const created = await prismaClient_1.default.user.create({
        data: Object.assign({ email: data.email, password: hashedPassword, name: data.name, referenceCode, referredById: null }, (data.role ? { role: data.role } : {})),
    });
    if (data.referenceCode) {
        await (0, referralService_1.createReferralOnSignup)(created.id, data.referenceCode);
    }
    const token = jsonwebtoken_1.default.sign({ id: created.id, role: created.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.json({
        token,
        user: {
            id: created.id,
            email: created.email,
            referenceCode: created.referenceCode,
        },
    });
};
exports.register = register;
const login = async (req, res) => {
    const data = authSchemas_1.loginSchema.parse(req.body);
    const user = await prismaClient_1.default.user.findUnique({ where: { email: data.email } });
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt_1.default.compare(data.password, user.password);
    if (!ok)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
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
exports.login = login;
const forgotPassword = async (req, res) => {
    // Minimal: generate token & send email via mailer.ts
    res.json({
        ok: true,
        message: 'If your email exists, you will receive a reset link',
    });
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    // Validate token & reset password
    res.json({ ok: true });
};
exports.resetPassword = resetPassword;
