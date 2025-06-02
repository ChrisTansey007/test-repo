# Stage 1: Build the React application
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json ./
# If package-lock.json is used, copy it as well
# COPY package-lock.json ./

# Install dependencies
# Using --legacy-peer-deps for broader compatibility, can be removed if not needed
RUN npm install --legacy-peer-deps

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Copy the build output from the build stage to Nginx's web server directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
