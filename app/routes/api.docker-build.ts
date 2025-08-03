import { type ActionFunctionArgs, json } from '@remix-run/cloudflare';
import JSZip from 'jszip';

interface DockerBuildRequest {
  projectFiles: Record<string, string>;
  projectName: string;
  nodeVersion?: string;
  port?: number;
  buildCommand?: string;
  startCommand?: string;
  environment?: Record<string, string>;
}

interface DockerBuildResponse {
  success: boolean;
  dockerfileContent?: string;
  dockerComposeContent?: string;
  buildInstructions?: string;
  downloadUrl?: string;
  error?: string;
}

// Detect project type and framework
function detectProjectFramework(files: Record<string, string>) {
  const packageJson = files['package.json'];

  if (packageJson) {
    try {
      const pkg = JSON.parse(packageJson);
      const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };

      if (dependencies.next) {
        return 'nextjs';
      }

      if (dependencies.react && dependencies.vite) {
        return 'vite-react';
      }

      if (dependencies.vue && dependencies.vite) {
        return 'vite-vue';
      }

      if (dependencies['@remix-run/react']) {
        return 'remix';
      }

      if (dependencies.astro) {
        return 'astro';
      }

      if (dependencies['@angular/core']) {
        return 'angular';
      }

      if (dependencies.svelte) {
        return 'svelte';
      }

      if (dependencies.express) {
        return 'express';
      }

      if (dependencies.fastify) {
        return 'fastify';
      }

      if (dependencies.nuxt) {
        return 'nuxt';
      }

      return 'node';
    } catch {
      return 'static';
    }
  }

  if (files['index.html']) {
    return 'static';
  }

  if (files['main.py'] || files['app.py']) {
    return 'python';
  }

  if (files['index.php']) {
    return 'php';
  }

  return 'static';
}

// Generate Dockerfile based on project type
function generateDockerfile(
  framework: string,
  nodeVersion: string = '18',
  port: number = 3000,
  buildCommand?: string,
  startCommand?: string,
): string {
  const dockerfiles: Record<string, string> = {
    nextjs: `# Multi-stage build for Next.js
FROM node:${nodeVersion}-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \\
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \\
  elif [ -f package-lock.json ]; then npm ci; \\
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \\
  else echo "Lockfile not found." && exit 1; \\
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN ${buildCommand || 'npm run build'}

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE ${port}

ENV PORT ${port}
ENV HOSTNAME "0.0.0.0"

CMD ["${startCommand || 'node server.js'}"]`,

    'vite-react': `FROM node:${nodeVersion}-alpine

# Set working directory
WORKDIR /app

# Add package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN ${buildCommand || 'npm run build'}

# Install serve to run the application
RUN npm install -g serve

# Expose port
EXPOSE ${port}

# Start the application
CMD ["${startCommand || 'serve -s dist -l ' + port}"]`,

    remix: `FROM node:${nodeVersion}-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN ${buildCommand || 'npm run build'}

# Expose port
EXPOSE ${port}

# Start the application
CMD ["${startCommand || 'npm start'}"]`,

    express: `FROM node:${nodeVersion}-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install app dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Expose port
EXPOSE ${port}

# Define the command to run the application
CMD ["${startCommand || 'node index.js'}"]`,

    fastify: `FROM node:${nodeVersion}-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install app dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Expose port
EXPOSE ${port}

# Define the command to run the application
CMD ["${startCommand || 'npm start'}"]`,

    static: `FROM nginx:alpine

# Copy static files to nginx directory
COPY . /usr/share/nginx/html

# Copy custom nginx config if exists
COPY nginx.conf /etc/nginx/conf.d/default.conf 2>/dev/null || echo "Using default nginx config"

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]`,

    python: `FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE ${port}

# Run the application
CMD ["${startCommand || 'python app.py'}"]`,

    php: `FROM php:8.2-apache

# Copy application code
COPY . /var/www/html/

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html

# Expose port
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]`,
  };

  return dockerfiles[framework] || dockerfiles.static;
}

// Generate docker-compose.yml
function generateDockerCompose(projectName: string, port: number = 3000, environment?: Record<string, string>): string {
  const envVars = environment
    ? Object.entries(environment)
        .map(([key, value]) => `      - ${key}=${value}`)
        .join('\n')
    : '';

  return `version: '3.8'

services:
  ${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}:
    build: .
    ports:
      - "${port}:${port}"
    environment:
      - NODE_ENV=production
${envVars}
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  app-data:
    driver: local`;
}

// Generate build instructions
function generateBuildInstructions(projectName: string, port: number): string {
  return `# Docker Build Instructions for ${projectName}

## Prerequisites
- Docker installed on your system
- Docker Compose (optional, for easier management)

## Quick Start

### Option 1: Using Docker directly
\`\`\`bash
# Build the Docker image
docker build -t ${projectName.toLowerCase()} .

# Run the container
docker run -p ${port}:${port} ${projectName.toLowerCase()}
\`\`\`

### Option 2: Using Docker Compose (Recommended)
\`\`\`bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
\`\`\`

## Development

### Build and run in development mode
\`\`\`bash
# Build the image
docker build -t ${projectName.toLowerCase()}:dev .

# Run with volume mounting for development
docker run -p ${port}:${port} -v $(pwd):/app ${projectName.toLowerCase()}:dev
\`\`\`

### Useful Docker commands
\`\`\`bash
# List running containers
docker ps

# View container logs
docker logs <container-id>

# Execute commands in running container
docker exec -it <container-id> /bin/sh

# Remove unused images and containers
docker system prune
\`\`\`

## Production Deployment

### Using Docker Hub
\`\`\`bash
# Tag your image
docker tag ${projectName.toLowerCase()} yourusername/${projectName.toLowerCase()}

# Push to Docker Hub
docker push yourusername/${projectName.toLowerCase()}

# Pull and run on production server
docker pull yourusername/${projectName.toLowerCase()}
docker run -d -p ${port}:${port} yourusername/${projectName.toLowerCase()}
\`\`\`

### Using Docker Swarm
\`\`\`bash
# Initialize swarm mode
docker swarm init

# Deploy as a service
docker service create --name ${projectName.toLowerCase()} --publish ${port}:${port} ${projectName.toLowerCase()}
\`\`\`

## Environment Variables
You can pass environment variables using the -e flag:
\`\`\`bash
docker run -p ${port}:${port} -e NODE_ENV=production -e API_KEY=your-key ${projectName.toLowerCase()}
\`\`\`

## Troubleshooting
- If port ${port} is already in use, change it: \`-p 8080:${port}\`
- For permission issues, try running with \`sudo\`
- Check container logs if the application doesn't start properly

Your application will be available at: http://localhost:${port}
`;
}

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const buildRequest: DockerBuildRequest = await request.json();
    const {
      projectFiles,
      projectName,
      nodeVersion = '18',
      port = 3000,
      buildCommand,
      startCommand,
      environment,
    } = buildRequest;

    // Detect project framework
    const framework = detectProjectFramework(projectFiles);

    // Generate Docker files
    const dockerfileContent = generateDockerfile(framework, nodeVersion, port, buildCommand, startCommand);
    const dockerComposeContent = generateDockerCompose(projectName, port, environment);
    const buildInstructions = generateBuildInstructions(projectName, port);

    // Create ZIP with all files
    const zip = new JSZip();

    // Add original project files
    for (const [filePath, content] of Object.entries(projectFiles)) {
      zip.file(filePath, content);
    }

    // Add Docker files
    zip.file('Dockerfile', dockerfileContent);
    zip.file('docker-compose.yml', dockerComposeContent);
    zip.file('BUILD_INSTRUCTIONS.md', buildInstructions);

    // Add nginx config for static sites
    if (framework === 'static') {
      zip.file(
        'nginx.conf',
        `server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}`,
      );
    }

    // Add .dockerignore
    zip.file(
      '.dockerignore',
      `node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.cache
.parcel-cache
dist
.next
.nuxt
.vuepress/dist
.serverless
.fusebox/
.dynamodb/
.tern-port
.vscode-test
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*`,
    );

    // Generate the ZIP file
    const zipBlob = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    // Create download URL
    const base64 = Buffer.from(zipBlob).toString('base64');
    const downloadUrl = `data:application/zip;base64,${base64}`;

    const response: DockerBuildResponse = {
      success: true,
      dockerfileContent,
      dockerComposeContent,
      buildInstructions,
      downloadUrl,
    };

    return json(response);
  } catch (error) {
    console.error('Docker build error:', error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}
