# --- Stage 1: Build Stage ---
# Use an official lightweight Node.js image
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker's layer caching
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# --- Stage 2: Production Stage ---
# Start from a fresh, clean base image for a smaller final size
FROM node:18-alpine

WORKDIR /app

# Copy the installed dependencies from the 'builder' stage
COPY --from=builder /app/node_modules ./node_modules

# Copy the application code from the 'builder' stage
COPY --from=builder /app .

# Let Docker know that the container listens on this port
EXPOSE 3001

# The command that will be run when the container starts
CMD ["node", "index.js"]