import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(getProfile));
router.put("/", asyncHandler(updateProfile));

export default router;
