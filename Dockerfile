# Multi-stage build for Node.js + Python
FROM node:18-alpine AS node-base

# Install Python and build tools
RUN apk add --no-cache \
    python3 \
    py3-pip \
    python3-dev \
    build-base \
    libffi-dev \
    libxml2-dev \
    libxslt-dev \
    openssl1.1-compat \
    libc6-compat

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install Node.js dependencies (including dev dependencies for build)
RUN npm ci

# Ensure Prisma uses musl binaries on Alpine and OpenSSL 1.1 compat
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl
ENV PRISMA_ENGINES_CHECKSUM_IGNORE=1

# Copy Python requirements
COPY requirements.txt ./

# Create Python virtual environment and install dependencies
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Copy templates
COPY templates/ ./templates/

# Make Python script executable
RUN chmod +x template_processor.py

# Expose port (Railway will set PORT environment variable)
EXPOSE $PORT

# Health check disabled (Railway has its own checks or can be configured separately)
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || '8000') + '/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]
