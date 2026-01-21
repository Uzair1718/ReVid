# Base image with Node.js
FROM node:22-bookworm-slim AS base

# Install system dependencies (Python, FFmpeg, Build Tools)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    git \
    make \
    g++ \
    chromium \
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libgbm-dev \
    libasound2 \
    libxrandr2 \
    libxkbcommon-dev \
    libxfixes3 \
    libxcomposite1 \
    libxdamage1 \
    libatk-bridge2.0-0 \
    libpango-1.0-0 \
    libcairo2 \
    libcups2 \
    && rm -rf /var/lib/apt/lists/*


# Set working directory
WORKDIR /app

# --- Python Setup ---
# Create a virtual environment for Python to avoid system package conflicts
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

# Install Python dependencies
# We install faster-whisper and its dependencies
RUN pip install faster-whisper

# --- Node.js Setup ---
# Copy package files
COPY package.json package-lock.json* ./

# Install Node dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build Next.js app
# Note: We might need to ensure the python script is executable
RUN chmod +x services/transcribe.py
RUN npm run build

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
