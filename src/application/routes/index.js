import { Router } from "express";

// MIDDLEWARES
import {
  checkUserFields,
  isValidPayload,
  checkHeaders,
} from "../middlewares/validators/index.validator.js";

import {checkSwipePayload, checkMatchParams} from "../middlewares/validators/swipe.validator.js"

import { authenticateJWT } from "../middlewares/guard.js";

// CONTROLLERS
import { generateToken, login } from "../controllers/auth.controller.js";
import {
  createUser,
  getAvailableUsers,
} from "../controllers/user.controller.js";

import {swipeAction, getMatchedSwipes} from "../controllers/swipe.controller.js"

const router = Router();

// AUTH AND SIGNUP
router.post("/auth", generateToken);
router.post("/auth/login", login);

// USERS
router.post("/users", authenticateJWT, checkUserFields, isValidPayload, createUser);
router.get("/users", authenticateJWT, checkHeaders, isValidPayload, getAvailableUsers);


// SWIPES AND MATCHS
router.post("/swipe", authenticateJWT, checkSwipePayload, isValidPayload, swipeAction);
router.get("/matchs/:email", authenticateJWT, checkMatchParams, isValidPayload, getMatchedSwipes);


export default router;
