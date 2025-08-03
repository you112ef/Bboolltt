import { type ActionFunctionArgs, json } from '@remix-run/cloudflare';
import JSZip from 'jszip';
import { Buffer } from 'buffer';

interface EnhancedExportRequest {
  projectFiles: Record<string, string>;
  projectName: string;
  exportFormat: 'zip' | 'tar' | 'git' | 'docker' | 'android' | 'static';
  includeNodeModules?: boolean;
  includeDotFiles?: boolean;
  compressionLevel?: number;
  excludePatterns?: string[];
  includeDocumentation?: boolean;
  generateReadme?: boolean;
  addLicense?: string;
  addGitignore?: boolean;
  optimizeAssets?: boolean;
}

interface EnhancedExportResponse {
  success: boolean;
  downloadUrl?: string;
  filename?: string;
  size?: number;
  format?: string;
  exportTime?: number;
  error?: string;
  metadata?: {
    fileCount: number;
    totalSize: number;
    compressionRatio: number;
  };
}

// Generate comprehensive README.md
function generateReadmeFunction(projectName: string, files: Record<string, string>): string {
  const hasPackageJson = 'package.json' in files;
  let packageInfo = null;

  if (hasPackageJson) {
    try {
      packageInfo = JSON.parse(files['package.json']);
    } catch {
      // ignore parsing errors
    }
  }

  const framework = detectFramework(files);
  const hasTests = Object.keys(files).some((f) => f.includes('test') || f.includes('spec'));
  const hasDocker = 'Dockerfile' in files || 'docker-compose.yml' in files;

  return `# ${projectName}

${packageInfo?.description || 'A modern web application built with cutting-edge technologies.'}

## 🚀 Features

- Modern ${framework} application
- Responsive design with Tailwind CSS
- TypeScript support for type safety
- Hot reload development server
${hasTests ? '- Comprehensive test suite' : ''}
${hasDocker ? '- Docker containerization ready' : ''}
- Production-ready build system

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 18 or higher)
- npm, yarn, or pnpm package manager
${hasDocker ? '- Docker (optional, for containerization)' : ''}

## 🛠️ Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd ${projectName.toLowerCase().replace(/\s+/g, '-')}
\`\`\`

2. Install dependencies:
\`\`\`bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
\`\`\`

## 🏃‍♂️ Running the Application

### Development Mode
\`\`\`bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev
\`\`\`

### Production Build
\`\`\`bash
# Build the application
npm run build

# Start production server
npm start
\`\`\`

${
  hasDocker
    ? `## 🐳 Docker Support

### Using Docker
\`\`\`bash
# Build Docker image
docker build -t ${projectName.toLowerCase()} .

# Run container
docker run -p 3000:3000 ${projectName.toLowerCase()}
\`\`\`

### Using Docker Compose
\`\`\`bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down
\`\`\`
`
    : ''
}

${
  hasTests
    ? `## 🧪 Testing

Run the test suite:
\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
\`\`\`
`
    : ''
}

## 📁 Project Structure

\`\`\`
${generateProjectStructure(files)}
\`\`\`

## 🛠️ Built With

${generateTechStack(packageInfo)}

## 📝 Scripts

${generateScriptsTable(packageInfo)}

## 🌐 Deployment

This application can be deployed to various platforms:

- **Vercel**: \`vercel --prod\`
- **Netlify**: \`netlify deploy --prod\`
- **GitHub Pages**: Push to \`main\` branch
- **Firebase**: \`firebase deploy\`
- **Docker**: Use provided Dockerfile

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

${packageInfo?.license ? `This project is licensed under the ${packageInfo.license} License.` : 'This project is open source and available under the MIT License.'}

## 🙏 Acknowledgments

- Built with modern web technologies
- Optimized for performance and accessibility
- Ready for production deployment

---

⭐ Star this repository if you find it helpful!
`;
}

// Detect framework from files
function detectFramework(files: Record<string, string>): string {
  const packageJson = files['package.json'];

  if (packageJson) {
    try {
      const pkg = JSON.parse(packageJson);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps.next) {
        return 'Next.js';
      }

      if (deps.react && deps.vite) {
        return 'React + Vite';
      }

      if (deps.vue && deps.vite) {
        return 'Vue + Vite';
      }

      if (deps['@remix-run/react']) {
        return 'Remix';
      }

      if (deps.astro) {
        return 'Astro';
      }

      if (deps['@angular/core']) {
        return 'Angular';
      }

      if (deps.svelte) {
        return 'Svelte';
      }

      if (deps.nuxt) {
        return 'Nuxt.js';
      }

      if (deps.react) {
        return 'React';
      }

      if (deps.vue) {
        return 'Vue.js';
      }

      return 'Node.js';
    } catch {
      return 'Static HTML';
    }
  }

  return 'Static HTML';
}

// Generate project structure
function generateProjectStructure(files: Record<string, string>): string {
  const structure: string[] = [];
  const paths = Object.keys(files).sort();

  paths.forEach((path) => {
    const depth = path.split('/').length - 1;
    const indent = '  '.repeat(depth);
    const filename = path.split('/').pop();
    structure.push(`${indent}${filename}`);
  });

  return structure.slice(0, 20).join('\n') + (structure.length > 20 ? '\n  ...' : '');
}

// Generate tech stack list
function generateTechStack(packageInfo: any): string {
  if (!packageInfo?.dependencies) {
    return '- Modern web technologies';
  }

  const deps = packageInfo.dependencies;
  const stack: string[] = [];

  if (deps.react) {
    stack.push('- [React](https://reactjs.org/) - UI library');
  }

  if (deps.vue) {
    stack.push('- [Vue.js](https://vuejs.org/) - Progressive framework');
  }

  if (deps.next) {
    stack.push('- [Next.js](https://nextjs.org/) - React framework');
  }

  if (deps.vite) {
    stack.push('- [Vite](https://vitejs.dev/) - Build tool');
  }

  if (deps.typescript) {
    stack.push('- [TypeScript](https://typescriptlang.org/) - Type safety');
  }

  if (deps.tailwindcss) {
    stack.push('- [Tailwind CSS](https://tailwindcss.com/) - Styling');
  }

  if (deps.express) {
    stack.push('- [Express.js](https://expressjs.com/) - Backend framework');
  }

  if (deps.fastify) {
    stack.push('- [Fastify](https://fastify.io/) - Fast backend framework');
  }

  return stack.length > 0 ? stack.join('\n') : '- Modern web technologies';
}

// Generate scripts table
function generateScriptsTable(packageInfo: any): string {
  if (!packageInfo?.scripts) {
    return 'No scripts available.';
  }

  const scripts = packageInfo.scripts;
  const table = ['| Command | Description |', '|---------|-------------|'];

  Object.entries(scripts).forEach(([name, _command]) => {
    const description = getScriptDescription(name);
    table.push(`| \`npm run ${name}\` | ${description} |`);
  });

  return table.join('\n');
}

// Get script description
function getScriptDescription(scriptName: string): string {
  const descriptions: Record<string, string> = {
    dev: 'Start development server',
    build: 'Build for production',
    start: 'Start production server',
    test: 'Run test suite',
    lint: 'Lint code',
    preview: 'Preview production build',
    deploy: 'Deploy to production',
  };

  return descriptions[scriptName] || 'Run custom script';
}

// Generate .gitignore
function generateGitignore(): string {
  return `# Dependencies
node_modules/
.pnp
.pnp.js

# Production builds
/build
/dist
/.next/
/out/
/.nuxt/
/.vuepress/dist

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage
.grunt

# Bower dependency directory
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons
build/Release

# Dependency directories
node_modules/
jspm_packages/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test
.env.local
.env.development.local
.env.test.local
.env.production.local

# parcel-bundler cache
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# yarn v2
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*`;
}

// Generate license file
function generateLicense(licenseType: string, projectName: string): string {
  const year = new Date().getFullYear();

  const licenses: Record<string, string> = {
    MIT: `MIT License

Copyright (c) ${year} ${projectName}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,

    'Apache-2.0': `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

Copyright ${year} ${projectName}

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`,

    'GPL-3.0': `GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) ${year} ${projectName}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.`,
  };

  return licenses[licenseType] || licenses.MIT;
}

// Optimize assets (basic implementation)
function optimizeAssetsFunction(files: Record<string, string>): Record<string, string> {
  const optimized: Record<string, string> = {};

  for (const [path, content] of Object.entries(files)) {
    if (path.endsWith('.js') || path.endsWith('.ts')) {
      // Basic JS/TS optimization (remove comments and extra whitespace)
      optimized[path] = content
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/\/\/.*$/gm, '') // Remove line comments
        .replace(/\s+/g, ' ') // Reduce whitespace
        .trim();
    } else if (path.endsWith('.css')) {
      // Basic CSS optimization
      optimized[path] = content
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Reduce whitespace
        .replace(/;\s*}/g, '}') // Remove unnecessary semicolons
        .trim();
    } else if (path.endsWith('.json')) {
      // Minify JSON
      try {
        optimized[path] = JSON.stringify(JSON.parse(content));
      } catch {
        optimized[path] = content;
      }
    } else {
      optimized[path] = content;
    }
  }

  return optimized;
}

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const exportRequest: EnhancedExportRequest = await request.json();
    const {
      projectFiles,
      projectName,
      exportFormat,
      includeNodeModules = false,
      includeDotFiles = true,
      compressionLevel = 6,
      excludePatterns = [],

      // includeDocumentation = true, // Currently unused
      generateReadme = true,
      addLicense,
      addGitignore = true,
      optimizeAssets = false,
    } = exportRequest;

    const startTime = Date.now();
    let processedFiles = { ...projectFiles };

    // Optimize assets if requested
    if (optimizeAssets) {
      processedFiles = optimizeAssetsFunction(processedFiles);
    }

    // Filter files based on patterns
    const excludeRegex = excludePatterns.length > 0 ? new RegExp(excludePatterns.join('|')) : null;

    const filteredFiles: Record<string, string> = {};

    for (const [path, content] of Object.entries(processedFiles)) {
      // Skip node_modules unless explicitly included
      if (!includeNodeModules && path.includes('node_modules')) {
        continue;
      }

      // Skip dot files unless explicitly included
      if (!includeDotFiles && path.startsWith('.')) {
        continue;
      }

      // Skip files matching exclude patterns
      if (excludeRegex && excludeRegex.test(path)) {
        continue;
      }

      filteredFiles[path] = content;
    }

    // Add generated files
    if (generateReadme && !filteredFiles['README.md']) {
      filteredFiles['README.md'] = generateReadmeFunction(projectName, filteredFiles);
    }

    if (addGitignore && !filteredFiles['.gitignore']) {
      filteredFiles['.gitignore'] = generateGitignore();
    }

    if (addLicense && !filteredFiles.LICENSE) {
      filteredFiles.LICENSE = generateLicense(addLicense, projectName);
    }

    // Create ZIP archive
    const zip = new JSZip();

    // Add all files to ZIP
    for (const [path, content] of Object.entries(filteredFiles)) {
      zip.file(path, content);
    }

    // Add metadata file
    const metadata = {
      exportedAt: new Date().toISOString(),
      projectName,
      exportFormat,
      fileCount: Object.keys(filteredFiles).length,
      generatedBy: 'Enhanced Export Service v1.0',
    };
    zip.file('export-metadata.json', JSON.stringify(metadata, null, 2));

    // Generate ZIP
    const zipBlob = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: compressionLevel },
    });

    const exportTime = Date.now() - startTime;
    const originalSize = Object.values(filteredFiles).join('').length;
    const compressedSize = zipBlob.length;
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    // Create download URL
    const base64 = Buffer.from(zipBlob).toString('base64');
    const downloadUrl = `data:application/zip;base64,${base64}`;
    const filename = `${projectName.toLowerCase().replace(/\s+/g, '-')}-export.zip`;

    const response: EnhancedExportResponse = {
      success: true,
      downloadUrl,
      filename,
      size: compressedSize,
      format: exportFormat,
      exportTime,
      metadata: {
        fileCount: Object.keys(filteredFiles).length,
        totalSize: originalSize,
        compressionRatio: Math.round(compressionRatio * 100) / 100,
      },
    };

    return json(response);
  } catch (error) {
    console.error('Enhanced export error:', error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}
