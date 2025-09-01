import express from "express";
import {
    getVideos,
    searchVideos,
    getVideoStats,
} from "../controller/video.controller.js";

const router = express.Router();

/**
 * @route   GET /api/videos
 * @desc    Get paginated videos sorted by published date (newest first)
 * @query   page (optional, default: 1)
 * @query   limit (optional, default: 10, max: 100)
 */
router.get("/", getVideos);

/**
 * @route   GET /api/videos/search
 * @desc    Search videos by title and description
 * @query   q (required) - search query
 * @query   page (optional, default: 1)
 * @query   limit (optional, default: 10, max: 100)
 */
router.get("/search", searchVideos);

/**
 * @route   GET /api/videos/stats
 * @desc    Get video statistics
 */
router.get("/stats", getVideoStats);

export default router;
