import express from "express";
import {
  getCompletions,
  getSchedule,
  getTodayWorkout,
  updateCompletions,
  updateSchedule
} from "../controllers/workoutController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/schedule", asyncHandler(getSchedule));
router.put("/schedule", asyncHandler(updateSchedule));
router.get("/completions", asyncHandler(getCompletions));
router.put("/completions/:date", asyncHandler(updateCompletions));
router.get("/today", asyncHandler(getTodayWorkout));

export default router;
