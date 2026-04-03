import express from "express";
import {
  getProgressEntries,
  getProgressEntryByDate,
  updateProgressEntry
} from "../controllers/progressController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(getProgressEntries));
router.get("/:date", asyncHandler(getProgressEntryByDate));
router.put("/:date", asyncHandler(updateProgressEntry));

export default router;
