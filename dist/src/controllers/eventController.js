"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchEvents = exports.listMyEvents = exports.updateEvent = exports.createEvent = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const createEvent = async (req, res) => {
    const { title, description, capacity, price, startAt, endAt } = req.body;
    const event = await prismaClient_1.default.event.create({
        data: {
            title,
            description,
            capacity,
            seatsLeft: capacity,
            price: Number(price),
            startAt: new Date(startAt),
            endAt: endAt ? new Date(endAt) : null,
            ownerId: req.user.id,
        },
    });
    res.json(event);
};
exports.createEvent = createEvent;
const updateEvent = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    const updated = await prismaClient_1.default.event.update({ where: { id }, data });
    res.json(updated);
};
exports.updateEvent = updateEvent;
const listMyEvents = async (req, res) => {
    const items = await prismaClient_1.default.event.findMany({
        where: { ownerId: req.user.id },
    });
    res.json({ items });
};
exports.listMyEvents = listMyEvents;
const searchEvents = async (req, res) => {
    const q = req.query.q || '';
    const page = Number(req.query.page || '1');
    const pageSize = Math.min(Number(req.query.pageSize || '10'), 50);
    const where = q
        ? { title: { contains: q, mode: 'insensitive' } }
        : {};
    const [items, total] = await prismaClient_1.default.$transaction([
        prismaClient_1.default.event.findMany({
            where,
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prismaClient_1.default.event.count({ where }),
    ]);
    if (!items.length)
        return res.json({ items: [], total, message: 'No events found' });
    res.json({ items, total });
};
exports.searchEvents = searchEvents;
