import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import videoRoutes from "./routes/video.routes.js";
import { fetchAndStoreVideos } from "./controller/video.controller.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware

// cors() for enabling Cross-Origin Resource Sharing
app.use(cors());
// middleware for parsing JSON requests
app.use(express.json());
// middleware for parsing URL-encoded requests
app.use(express.urlencoded({ extended: true }));
// morgan as a logging middleware
app.use(morgan("combined"));

// Routes
app.use("/api/videos", videoRoutes);

// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "YouTube Video API is running",
        timestamp: new Date().toLocaleString("en-UK", {
            timeZone: "Asia/Kolkata",
        }),
        endpoints: {
            videos: "/api/videos",
            search: "/api/videos/search",
            stats: "/api/videos/stats",
        },
    });
});


// Start background video fetching service
const startBackgroundFetching = () => {
    const intervalMs = parseInt(process.env.FETCH_INTERVAL) || 20000;

    console.log(`Starting background video fetching every ${intervalMs}ms`);

    // Fetch videos immediately
    fetchAndStoreVideos();

    // Fetching videos at regular interval
    setInterval(() => {
        fetchAndStoreVideos();
    }, intervalMs);
};

// Graceful shutdown
const gracefulShutdown = () => {
    console.log("\nShutting down...");
    process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Search Query: ${process.env.SEARCH_QUERY || "cricket"}`);

    // Start background fetching after server is up
    startBackgroundFetching();
});

export default app;
