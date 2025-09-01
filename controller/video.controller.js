import axios from "axios";
import Video from "../models/video.models.js";

// Fetch videos from YouTube API and store in database
const fetchAndStoreVideos = async () => {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY;
        const searchQuery = process.env.SEARCH_QUERY || "cricket";

        if (!apiKey || apiKey === "YOUR_YOUTUBE_API_KEY") {
            console.error("YouTube API key not configured properly");
            return;
        }

        // Timestamp from 1 hour ago to fetch recent videos
        const publishedAfter = new Date(
            Date.now() - 60 * 60 * 1000
        ).toISOString();

        const response = await axios.get(
            process.env.YOUTUBE_API_URL,
            {
                params: {
                    part: "snippet",
                    q: searchQuery,
                    type: "video",
                    order: "date",
                    publishedAfter: publishedAfter,
                    maxResults: 50,
                    key: apiKey,
                },
            }
        );

        const videos = response.data.items;

        let savedCount = 0;

        for (const videoData of videos) {
            const video = {
                videoId: videoData.id.videoId,
                title: videoData.snippet.title,
                description: videoData.snippet.description,
                publishedAt: new Date(videoData.snippet.publishedAt),
                thumbnail: videoData.snippet.thumbnails?.default || {
                    url: "",
                    width: 0,
                    height: 0,
                },
                channelId: videoData.snippet.channelId,
                channelTitle: videoData.snippet.channelTitle,
                // etag: videoData.etag,
            };

            try {
                await Video.findOneAndUpdate(
                    { videoId: video.videoId },
                    video,
                    { upsert: true, new: true }
                );
                savedCount++;
            } catch (error) {
                if (error.code !== 11000) {
                    // Ignore duplicate key errors, log others
                    console.error(
                        `Error saving video ${video.videoId}:`,
                        error.message
                    );
                }
            }
        }

        console.log(
            `Fetched ${videos.length} videos, saved/updated ${savedCount} videos`
        );
    } catch (error) {
        console.error("Error fetching videos from YouTube:", error.message);
        if (error.response?.data?.error) {
            console.error("YouTube API Error:", error.response.data.error);
        }
    }
};

// Get paginated videos sorted by published date (newest first)
const getVideos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100",
            });
        }

        // Fetching videos with pagination
        const videos = await Video.find()
            .select("-__v")
            .sort({ publishedAt: -1, _id: 1 }) // Secondary sort by _id for consistent pagination
            .skip(skip)
            .limit(limit)
            .lean();

        const totalVideos = await Video.countDocuments();
        const totalPages = Math.ceil(totalVideos / limit);

        res.json({
            success: true,
            data: {
                videos,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalVideos,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                    limit,
                },
            },
        });
    } catch (error) {
        console.error("Error getting videos:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Search videos by title and description with partial matching
const searchVideos = async (req, res) => {
    try {
        const { q: query } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Search query is required",
            });
        }

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100",
            });
        }

        const searchTerms = query.trim().split(/\s+/);

        // Create regex patterns for partial matching
        const titleRegexes = searchTerms.map((term) => new RegExp(term, "i"));
        const descriptionRegexes = searchTerms.map(
            (term) => new RegExp(term, "i")
        );

        // Build search query - match videos where ANY search term appears in title OR description
        const searchCondition = {
            $or: [
                { title: { $in: titleRegexes } },
                { description: { $in: descriptionRegexes } },
            ],
        };

        // Fetching searched videos with pagination
        const videos = await Video.find(searchCondition)
            .select("-__v")
            .sort({ publishedAt: -1, _id: 1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const totalVideos = await Video.countDocuments(searchCondition);
        const totalPages = Math.ceil(totalVideos / limit);

        res.json({
            success: true,
            data: {
                videos,
                searchQuery: query,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalVideos,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                    limit,
                },
            },
        });
    } catch (error) {
        console.error("Error searching videos:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Get video statistics
const getVideoStats = async (req, res) => {
    try {
        const totalVideos = await Video.countDocuments();
        const latestVideo = await Video.findOne()
            .sort({ publishedAt: -1 })
            .lean();
        const oldestVideo = await Video.findOne()
            .sort({ publishedAt: 1 })
            .lean();

        res.json({
            success: true,
            data: {
                totalVideos,
                latestVideo: latestVideo
                    ? {
                          title: latestVideo.title,
                          publishedAt: latestVideo.publishedAt,
                      }
                    : null,
                oldestVideo: oldestVideo
                    ? {
                          title: oldestVideo.title,
                          publishedAt: oldestVideo.publishedAt,
                      }
                    : null,
            },
        });
    } catch (error) {
        console.error("Error getting video stats:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export { fetchAndStoreVideos, getVideos, searchVideos, getVideoStats };
