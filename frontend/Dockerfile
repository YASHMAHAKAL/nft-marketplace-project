# --- Stage 1: Build Stage ---
# Use a Node.js image to build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the application for production
# This creates a 'dist' folder with static files
RUN npm run build

# --- Stage 2: Production Stage ---
# Use a lightweight Nginx web server to serve the static files
FROM nginx:stable-alpine

# Copy the built files from the 'build' stage to the Nginx web root directory
COPY --from=build /app/dist /usr/share/nginx/html

# Let Docker know that the container listens on port 80
EXPOSE 80

# The command to start the Nginx server
CMD ["nginx", "-g", "daemon off;"]