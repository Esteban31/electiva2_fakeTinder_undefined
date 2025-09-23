import { Router } from "express";

// MIDDLEWARES
import {
  checkUserFields,
  isValidPayload,
  checkHeaders,
} from "../middlewares/validators/index.validator.js";

import { authenticateJWT } from "../middlewares/guard.js";

import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateToopics
} from "../controllers/user.controller.js";

const router = Router();

// USER
router.post("/", checkUserFields, isValidPayload, createUser);
router.get("/", authenticateJWT, checkHeaders, isValidPayload, getUsers); //GET USERS
router.get("/:id", authenticateJWT, getUserById); //GET USER BY ID
router.put("/", authenticateJWT, updateUser); //UPDATE USER
router.put("/toopics", authenticateJWT, updateToopics); //UPDATE TOOPICS


export default router;
