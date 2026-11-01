import { Router } from "express";

import {
  register,
  login,
  getMe,
  updateProfile,
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// Register a new user
router.post("/register", register);

// Authenticate an existing user
router.post("/login", login);

// Get the currently authenticated user's profile
router.get("/me", protect, getMe);

// Update the currently authenticated user's profile
router.put("/profile", protect, updateProfile);

export default router;
