import express from "express";
import { getPhotos } from "../controllers/photoController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(getPhotos));

export default router;
