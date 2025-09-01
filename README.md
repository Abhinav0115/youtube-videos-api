# YouTube Video API

A Node.js API that continuously fetches the latest YouTube videos for a given search query and provides paginated endpoints for viewing and searching the stored videos.

## Features

- ✅ **Background Video Fetching**: Continuously fetches latest videos from YouTube API
- ✅ **Paginated API**: Get stored videos with pagination support
- ✅ **Smart Search**: Search videos with partial matching in title/description
- ✅ **Optimized Database**: Proper indexing for fast queries
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **Scalable Architecture**: Clean separation of concerns
- ✅ **Docker Support**: Production-ready containerization
- ✅ **MongoDB Integration**: Persistent data storage with authentication

## Requirements

- Node.js 20+
- MongoDB 7.0+
- YouTube Data API v3 Key
- Docker & Docker Compose (for containerized deployment)

## Quick Start with Docker (Recommended)

1. **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd youtube-video
    ```

2. **Configure environment variables:**
   Edit `.env.production` file:

    ```bash
    YOUTUBE_API_KEY=your_actual_youtube_api_key
    SEARCH_QUERY=cricket
    FETCH_INTERVAL=10000
    MONGO_PASSWORD=your_secure_password
    ```

3. **Start with Docker:**

    ```bash
    docker-compose up -d
    ```

4. **Access the API:**
    - API: http://localhost:3000
    - MongoDB: localhost:27017

## Manual Setup (Development)

1. **Install dependencies:**

    ```bash
    npm install
    ```

2. **Configure environment variables:**
   Create a `.env` file:

    ```bash
    YOUTUBE_API_KEY=your_youtube_api_key
    SEARCH_QUERY=cricket
    FETCH_INTERVAL=10000
    MONGO_URI=mongodb://localhost:27017/youtube
    PORT=5000
    ```

3. **Start MongoDB:**

    ```bash
    # Using Docker
    docker run -d -p 27017:27017 --name mongodb mongo:7.0
    ```

4. **Run the application:**

    ```bash
    # Development mode
    npm run dev

    # Production mode
    npm start
    ```

## Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Copy the API key to your environment file

## Docker Configuration

The project includes production-ready Docker configuration:

- **Dockerfile**: Multi-stage Node.js Alpine build
- **docker-compose.yml**: Orchestrates app and MongoDB services
- **Data Persistence**: MongoDB data volume for persistent storage
- **Environment**: Production environment configuration

### Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f app
docker-compose logs -f mongodb

# Stop services
docker-compose down

# Rebuild and start
docker-compose up -d --build

# Check container status
docker-compose ps
```

## API Endpoints

### 1. Get Videos (Paginated)

```
GET /api/videos?page=1&limit=10
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Videos per page (default: 10, max: 100)

**Response:**

```json
{
    "success": true,
    "data": {
        "videos": [
            {
                "_id": "...",
                "videoId": "dQw4w9WgXcQ",
                "title": "Video Title",
                "description": "Video description...",
                "publishedAt": "2023-12-01T10:30:00.000Z",
                "thumbnail": {
                    "url": "https://i.ytimg.com/vi/videoId/default.jpg",
                    "width": 120,
                    "height": 90
                },
                "channelId": "...",
                "channelTitle": "Channel Name"
            }
        ],
        "pagination": {
            "currentPage": 1,
            "totalPages": 5,
            "totalVideos": 50,
            "hasNextPage": true,
            "hasPreviousPage": false,
            "limit": 10
        }
    }
}
```

### 2. Search Videos

```
GET /api/videos/search?q=cricket match&page=1&limit=10
```

**Query Parameters:**

- `q` (required): Search query
- `page` (optional): Page number (default: 1)
- `limit` (optional): Videos per page (default: 10, max: 100)

**Features:**

- Partial matching: "tea how" matches "How to make tea?"
- Searches both title and description
- Case-insensitive
- Multiple word support

**Response:**

```json
{
  "success": true,
  "data": {
    "videos": [ ... ],
    "pagination": { ... }
  }
}
```

### 3. Get Statistics

```
GET /api/videos/stats
```

**Response:**

```json
{
    "success": true,
    "data": {
        "totalVideos": 150,
        "latestVideo": {
            "title": "Latest Video Title",
            "publishedAt": "2023-12-01T10:35:00.000Z"
        },
        "oldestVideo": {
            "title": "Oldest Video Title",
            "publishedAt": "2023-11-01T08:15:00.000Z"
        }
    }
}
```

### 4. Health Check

```
GET /
```

**Response:**

```json
{
    "success": true,
    "message": "YouTube Video API is running",
    "timestamp": "01/09/2025, 11:35:40",
    "endpoints": {
        "videos": "/api/videos",
        "search": "/api/videos/search",
        "stats": "/api/videos/stats"
    }
}
```

## Project Structure

```
├── app.js                   # Main application entry point
├── config/
│   └── db.js               # MongoDB connection configuration
├── models/
│   └── video.models.js     # Video schema with optimized indexes
├── controller/
│   └── video.controller.js # Business logic and YouTube API integration
├── routes/
│   └── video.routes.js     # API route definitions
├── package.json            # Node.js dependencies and scripts
├── .env                    # Development environment variables
├── .env.production         # Production environment variables
├── .env.example           # Environment variables template
├── docker-compose.yml     # Docker services orchestration
├── Dockerfile             # Docker container configuration
├── .dockerignore          # Docker build context exclusions
└── README.md              # This file
```

## Database Schema

```javascript
{
  videoId: String,        // Unique YouTube video ID (indexed)
  title: String,          // Video title (text indexed)
  description: String,    // Video description (text indexed)
  publishedAt: Date,      // Video publication date (indexed)
  thumbnail: {
    url: String,          // Thumbnail image URL
    width: Number,        // Thumbnail width
    height: Number        // Thumbnail height
  },
  channelId: String,      // YouTube channel ID (indexed)
  channelTitle: String,   // Channel name
  createdAt: Date,        // Record creation time
  updatedAt: Date         // Record last update time
}
```

## Database Optimizations

### Indexes

- **videoId**: Unique index for fast lookups and duplicate prevention
- **publishedAt**: Descending index for chronological sorting
- **title & description**: Text indexes for full-text search capabilities
- **Compound indexes**: Optimized queries combining search with sorting

<!-- ### Search Algorithm
- Splits search query into individual words
- Creates regex patterns for partial matching
- Searches both title and description fields
- Case-insensitive matching -->

### Background Processing

- Runs independently of API requests
- Uses `publishedAfter` parameter to avoid duplicates
- Handles API rate limits and errors gracefully
- Stores only new videos (prevents duplicates)

## Error Handling

- **YouTube API Errors**: Logged and handled gracefully
- **Database Errors**: Duplicate key errors handled for concurrent operations
- **Validation Errors**: Proper HTTP status codes and error messages
- **Rate Limiting**: Built-in handling for YouTube API limits

## Environment Variables

| Variable          | Description                   | Default                                      | Required |
| ----------------- | ----------------------------- | -------------------------------------------- | -------- |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key       | -                                            | Yes      |
| `SEARCH_QUERY`    | Search query for videos       | "cricket"                                    | No       |
| `FETCH_INTERVAL`  | Fetch interval (milliseconds) | 10000                                        | No       |
| `MONGO_URI`       | MongoDB connection string     | mongodb://localhost:27017/youtube            | No       |
| `MONGO_PASSWORD`  | MongoDB root password         | securepassword123                            | No       |
| `PORT`            | Server port                   | 5000                                         | No       |
| `YOUTUBE_API_URL` | YouTube API endpoint          | https://www.googleapis.com/youtube/v3/search | No       |

### Production Environment (.env.production)

```bash
YOUTUBE_API_KEY=your_actual_youtube_api_key
SEARCH_QUERY=cricket
FETCH_INTERVAL=10000
MONGO_URI=mongodb://admin:securepassword123@mongodb:27017/youtube?authSource=admin
MONGO_PASSWORD=securepassword123
PORT=5000
YOUTUBE_API_URL=https://www.googleapis.com/youtube/v3/search
```

## Development

### Scripts

```bash
# Install dependencies
npm install

# Development mode with auto-restart
npm run dev

# Production mode
npm start

# Run with Docker
docker-compose up -d

# View logs
docker-compose logs -f app
```

### Development Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Configure `.env` file with your API key
4. Start MongoDB: `docker run -d -p 27017:27017 mongo:7.0`
5. Run application: `npm run dev`

## Background Processing

- **Automatic Fetching**: Runs independently of API requests
- **Recent Videos**: Uses `publishedAfter` parameter (last 1 hour)
- **Duplicate Prevention**: `videoId` unique constraint prevents duplicates
- **Error Handling**: Graceful handling of API rate limits and errors
- **Configurable Interval**: Set via `FETCH_INTERVAL` environment variable

## Production Considerations

1. **API Key Security**: Keep YouTube API key secure and rotate regularly
2. **Rate Limiting**: YouTube API has daily quotas (10,000 units/day)
3. **Database**: Use MongoDB Atlas or dedicated MongoDB cluster
4. **Monitoring**: Implement health checks and monitoring
5. **Logging**: Configure structured logging for production
6. **Security**: Use environment variables, secure MongoDB credentials
7. **Scaling**: Consider Redis caching for high-traffic scenarios

## Troubleshooting

### Common Issues

**API Key Issues:**

- Ensure YouTube Data API v3 is enabled in Google Cloud Console
- Verify API key has proper permissions
- Check quota limits in Google Cloud Console

**Docker Issues:**

- Ensure Docker and Docker Compose are installed
- Check if ports 3000 and 27017 are available
- Verify `.env.production` file exists and has correct values

**Database Issues:**

- Ensure MongoDB container is running: `docker-compose ps`
- Check MongoDB logs: `docker-compose logs mongodb`
- Verify MongoDB authentication credentials

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

ISC License

<!-- ## Support

For issues and questions:

1. Check this README for common solutions
2. Review application logs: `docker-compose logs app`
3. Verify environment configuration
4. Check YouTube API quota usage in Google Cloud Console

## API Usage Examples

### Using cURL

#### Fetch Latest Videos

```bash
curl "http://localhost:3000/api/videos?page=1&limit=5"
```

#### Search for Content

```bash
curl "http://localhost:3000/api/videos/search?q=cricket%20match&page=1&limit=10"
```

#### Get Statistics

```bash
curl "http://localhost:3000/api/videos/stats"
```

#### Health Check

```bash
curl "http://localhost:3000/"
```

### Using PowerShell (Windows)

#### Fetch Latest Videos

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/videos?page=1&limit=5" -Method GET
```

#### Search for Content

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/videos/search?q=cricket&page=1&limit=3" -Method GET
``` -->

## Deployment

### Local Development

1. Configure `.env` file
2. Start MongoDB locally
3. Run `npm run dev`

### Docker Production

1. Configure `.env.production` file
2. Run `docker-compose up -d`
3. Access API at http://localhost:3000

<!-- ### Cloud Deployment

- **MongoDB**: Use MongoDB Atlas
- **Container**: Deploy to AWS ECS, Google Cloud Run, or Azure Container Instances
- **Environment**: Set production environment variables
- **Monitoring**: Add application monitoring (New Relic, DataDog, etc.)
- **Scaling**: Use load balancers and multiple container instances -->
