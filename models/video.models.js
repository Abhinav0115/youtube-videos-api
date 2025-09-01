import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
    {
        videoId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        publishedAt: {
            type: Date,
            required: true,
            // index: -1, // Descending index for efficient sorting
        },
        thumbnail: {
            url: String,
            width: Number,
            height: Number,
        },
        channelId: {
            type: String,
            required: true,
        },
        channelTitle: {
            type: String,
            required: true,
        },
        // etag: String,
    },
    {
        timestamps: true,
    }
);

// Index for search functionality
videoSchema.index({
    title: "text",
    description: "text",
});

// Index for efficient pagination
videoSchema.index({ publishedAt: -1, _id: 1 });

export default mongoose.model("Video", videoSchema);
