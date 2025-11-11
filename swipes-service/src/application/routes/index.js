import { Router } from "express";

// MIDDLEWARES
import {
  isValidPayload,
} from "../middlewares/validators/index.validator.js";

import {checkSwipePayload, checkMatchParams} from "../middlewares/validators/swipe.validator.js"

import { authenticateJWT } from "../middlewares/guard.js";

// CONTROLLERS
import {swipeAction} from "../controllers/swipe.controller.js"

import { getMatchByUderId, addMessage } from "../controllers/match.controller.js";

const router = Router();


// SWIPES AND MATCHS
router.post("/swipe", authenticateJWT, checkSwipePayload, isValidPayload, swipeAction);
router.get("/matchs/:userId", authenticateJWT, checkMatchParams, isValidPayload, getMatchByUderId);
router.put("/matchs/messages", authenticateJWT, addMessage);


export default router;
