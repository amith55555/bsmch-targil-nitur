# Use the official, lightweight Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install the dependencies (like prom-client)
RUN npm install

# Copy your server code into the container
COPY server.js .

# Expose the port the backend runs on
EXPOSE 3040

# Command to start the server
CMD ["node", "server.js"]