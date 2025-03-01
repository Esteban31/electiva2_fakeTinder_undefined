import { Router } from "express";
import { query } from 'express-validator';

// CONTROLLERS
import {getUserList} from "../controllers/userController.js"


const router = Router();

// TEST ROUTES
router.get("/users", query('person').notEmpty(), getUserList);

export default router;