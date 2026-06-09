# Use the official, lightweight Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the server file into the container
# (If you eventually add a package.json, you would copy it and run npm install here)
COPY server.js .

# Expose the port the backend runs on
EXPOSE 3000

# Command to start the server
CMD ["node", "server.js"]