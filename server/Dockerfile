# Use Node.js LTS Alpine for smaller image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "index.js"]
