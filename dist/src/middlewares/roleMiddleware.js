"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permit = void 0;
const permit = (...roles) => (req, res, next) => {
    if (!req.user)
        return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role))
        return res.status(403).json({ error: 'Forbidden' });
    next();
};
exports.permit = permit;
