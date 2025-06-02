# Deployment Guide

This document provides instructions for building and deploying this React application, primarily using Docker.

## Prerequisites

*   **Node.js and npm:** Required for local development and if not using Docker for building. Ensure a recent LTS version of Node.js is installed.
*   **Docker:** Required for building and running the application using the provided Dockerfile. Visit [docker.com](https://www.docker.com/get-started) to install Docker Desktop.

## Building and Running with Docker (Recommended)

This is the recommended method for creating a consistent build and runtime environment.

1.  **Build the Docker Image:**
    Open your terminal in the root directory of this project (where the `Dockerfile` is located) and run:
    ```bash
    docker build -t react-dashboard-app .
    ```
    Alternatively, if you added the script to `package.json`:
    ```bash
    npm run docker:build
    ```
    This command builds a Docker image tagged as `react-dashboard-app`.

2.  **Run the Docker Container:**
    Once the image is built, you can run it as a container:
    ```bash
    docker run -p 3000:80 react-dashboard-app
    ```
    Alternatively, if you added the script to `package.json`:
    ```bash
    npm run docker:run
    ```
    This command:
    *   Runs a container from the `react-dashboard-app` image.
    *   Maps port 3000 on your host machine to port 80 inside the container (where Nginx is serving the app).
    *   You can then access the application by navigating to `http://localhost:3000` in your web browser.

## Building for Manual Deployment (Without Docker)

If you prefer to build the application manually and deploy the static assets to a web server or hosting platform:

1.  **Install Dependencies:**
    Ensure all dependencies are installed:
    ```bash
    npm install
    ```
    *Note: There have been issues with `npm install` in some specific sandboxed environments. This command is expected to work in a standard local development environment.*

2.  **Build the Application:**
    Run the build script:
    ```bash
    npm run build
    ```
    This will create a `build` directory in your project root. This directory contains the static, optimized assets for your application.

3.  **Deploy Static Assets:**
    The contents of the `build` directory can be deployed to any static web hosting service, such as:
    *   Netlify
    *   Vercel
    *   GitHub Pages
    *   AWS S3 (with static website hosting enabled)
    *   Firebase Hosting
    *   Your own web server (Nginx, Apache, Caddy, etc.) - configure it to serve the `index.html` file for all routes if using client-side routing.

    For serving locally for testing the build (if you don't want to use Docker):
    ```bash
    npm install -g serve
    serve -s build
    ```
    This will typically serve the app on `http://localhost:3000` (or the first available port).

## Environment Variables

Currently, the application does not rely heavily on runtime environment variables beyond those implicitly handled by Create React App (like `PUBLIC_URL`). If future development introduces API keys or other sensitive configurations:

*   For **Create React App** (which `react-scripts` is based on), you can use `.env` files. Variables must be prefixed with `REACT_APP_`. Example: `REACT_APP_API_URL=https://api.example.com`.
*   When using **Docker**, these can be passed into the container at runtime using the `-e` flag with `docker run` or through Docker Compose environment files. The application would then need to be configured to read these at runtime (e.g., via a placeholder in `index.html` that gets replaced by a startup script, or by serving a config file).

## Known Issues in Specific Environments

*   **Sandboxed Execution Environments:** In some restricted cloud-based execution environments, `npm install` and consequently `npm run build` or `npm start` might fail due to limitations in how Node.js binaries or `node_modules/.bin` are handled. Dockerizing the application (as described above) is the recommended way to bypass these environmental inconsistencies.
