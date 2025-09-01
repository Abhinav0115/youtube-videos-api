# Production Dockerfile for YouTube Video API
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy application source
COPY . .

# Expose port
EXPOSE 8000

# Start application
CMD ["node", "app.js"]
