"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const auth_1 = __importDefault(require("./routers/auth"));
const users_1 = __importDefault(require("./routers/users"));
const events_1 = __importDefault(require("./routers/events"));
const transactions_1 = require("./routers/transactions");
const stats_1 = __importDefault(require("./routers/stats"));
const app = (0, express_1.default)();
// middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// routers
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/events', events_1.default);
app.use('/api/transactions', transactions_1.transactionsRouter);
app.use('/stats', stats_1.default);
app.get('/', (_req, res) => res.json({ ok: true, message: 'Platform Manajemen Acara API (TS)' }));
// error middleware
app.use(error_middleware_1.default);
exports.default = app;
