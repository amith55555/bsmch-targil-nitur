# Use a lightweight Node.js Alpine image
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy your application code and the new tracing configuration
COPY server.js tracing.js ./

# Run the container as an unprivileged user for security
USER node

# Expose the backend port
EXPOSE 3040

# CRITICAL: Start Node with the tracing file required before the server
CMD ["node", "--require", "./tracing.js", "server.js"]