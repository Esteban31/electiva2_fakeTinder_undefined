import { body, header } from 'express-validator';

import { validationResult } from "express-validator";


export const checkHeaders = [
  header('currentUser').isEmail().notEmpty()
]

export const checkUserFields = [
    body('email').isEmail(),
    body('password').notEmpty(),
    body('firstName').escape().notEmpty(),
    body('lastName').escape().notEmpty()
]

export const isValidPayload = (req,res, next) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      return next()
    }
  
    res.send({ errors: result.array() });
}