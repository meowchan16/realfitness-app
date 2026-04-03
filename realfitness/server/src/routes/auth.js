import express from "express";
import {
  completeGoogleAuth,
  getProviders,
  getSession,
  login,
  logout,
  startGoogleAuth
} from "../controllers/authController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/providers", asyncHandler(getProviders));
router.get("/session", asyncHandler(getSession));
router.get("/google", asyncHandler(startGoogleAuth));
router.get("/google/callback", asyncHandler(completeGoogleAuth));
router.post("/login", asyncHandler(login));
router.post("/logout", asyncHandler(logout));

export default router;
