import { Router } from "express";

// MIDDLEWARES
import {
  checkUserFields,
  isValidPayload,
  checkHeaders,
} from "../validators/index.validator.js";
import { authenticateJWT } from "../middlewares/guard.js";

// CONTROLLERS
import { generateToken } from "../controllers/auth.controller.js";
import {
  createUser,
  getAvailableUsers,
} from "../controllers/user.controller.js";

const router = Router();

// AUTH
router.post("/auth", generateToken);

// USERS
router.post("/users", authenticateJWT, checkUserFields, isValidPayload, createUser);
router.get("/users", authenticateJWT, checkHeaders, isValidPayload, getAvailableUsers);


// SWIPES
router.post("/swipe", authenticateJWT, checkUserFields, isValidPayload, createUser);


export default router;
