import { body, param } from 'express-validator';

export const checkSwipePayload = [
    body('emailUser').isEmail(),
    body('targetEmailUser').isEmail(),
    body('action').notEmpty()
]


export const checkMatchParams = [
    param('email').isEmail().notEmpty(),
]