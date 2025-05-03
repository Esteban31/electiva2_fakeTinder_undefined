import { body, param } from 'express-validator';

export const checkSwipePayload = [
    body('userId').notEmpty(),
    body('targetUserId').notEmpty(),
    body('action').notEmpty()
]


export const checkMatchParams = [
    param('userId').notEmpty(),
]