import { Router } from "express";

// CONTROLLERS
import { generateToken, login } from "../controllers/auth.controller.js";


const router = Router();

// AUTH
router.post("/token", generateToken);
router.post("/login", login);


export default router;
