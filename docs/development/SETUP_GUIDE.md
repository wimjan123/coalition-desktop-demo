# Setup Guide - Coalition Desktop

## Prerequisites

### System Requirements

#### Operating System
- **macOS**: 10.15 (Catalina) or later
- **Windows**: 10 version 1809 or later
- **Linux**: Ubuntu 18.04, Debian 10, or equivalent

#### Development Environment
- **Node.js**: v22 LTS or later
- **npm**: v10 or later (comes with Node.js)
- **Git**: Latest stable version
- **Code Editor**: VS Code recommended with extensions

#### For Native Builds (Tauri)
- **Rust**: Latest stable version
- **Tauri CLI**: v2.x
- **Platform-specific tools**:
  - **macOS**: Xcode Command Line Tools
  - **Windows**: Microsoft Visual Studio Build Tools 2019
  - **Linux**: WebKit2GTK development packages

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-username/coalition-desktop.git
cd coalition-desktop
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Tauri CLI (if not already installed)
npm install -g @tauri-apps/cli@next
```

### 3. Development Server
```bash
# Start web development server
npm run dev

# Or start Tauri development environment
npm run tauri dev
```

### 4. Verify Installation
Open your browser to `http://localhost:5173` (web mode) or the Tauri window should open automatically (native mode).

## Detailed Installation

### Node.js and npm

#### Using Node Version Manager (Recommended)
```bash
# Install nvm (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Windows (using nvm-windows)
# Download and install from: https://github.com/coreybutler/nvm-windows

# Install and use Node.js v22 LTS
nvm install 22
nvm use 22
nvm alias default 22
```

#### Direct Installation
Download from [nodejs.org](https://nodejs.org/) and install the LTS version.

#### Verify Installation
```bash
node --version  # Should show v22.x.x
npm --version   # Should show v10.x.x
```

### Rust and Tauri

#### Install Rust
```bash
# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Windows
# Download and run rustup-init.exe from https://rustup.rs/
```

#### Configure Rust
```bash
# Add to PATH (usually automatic)
source ~/.cargo/env

# Verify installation
rustc --version
cargo --version
```

#### Install Tauri CLI
```bash
# Install globally
npm install -g @tauri-apps/cli@next

# Or install locally in project
npm install --save-dev @tauri-apps/cli@next

# Verify installation
tauri --version
```

### Platform-Specific Setup

#### macOS
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Verify installation
clang --version
```

#### Windows
1. Download and install Microsoft Visual Studio Build Tools 2019
2. During installation, select "C++ build tools" workload
3. Restart your terminal/command prompt

#### Linux (Ubuntu/Debian)
```bash
# Install required packages
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

# For other distributions, check Tauri prerequisites:
# https://tauri.app/v1/guides/getting-started/prerequisites
```

## Project Setup

### 1. Clone and Install
```bash
# Clone the repository
git clone https://github.com/your-username/coalition-desktop.git
cd coalition-desktop

# Install all dependencies
npm install
```

### 2. Environment Configuration

#### Create Environment Files
```bash
# Copy example environment files
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

#### Environment Variables
```bash
# .env.local
VITE_APP_NAME="Coalition Desktop"
VITE_APP_VERSION="1.0.0"
VITE_ENABLE_DEBUG=true
VITE_PERSISTENCE_KEY="coalition-desktop"
```

### 3. Verify Dependencies
```bash
# Check all dependencies are installed
npm ls

# Check for vulnerabilities
npm audit

# Fix any issues
npm audit fix
```

## Development Scripts

### Available Scripts
```bash
# Development
npm run dev              # Start web development server
npm run tauri dev        # Start Tauri development environment
npm run preview          # Preview production build

# Building
npm run build            # Build for web
npm run tauri build      # Build native app
npm run build:analyze    # Analyze bundle size

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Linting and Formatting
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking

# Utilities
npm run clean            # Clean build artifacts
npm run deps:update      # Update dependencies
npm run deps:check       # Check for outdated dependencies
```

### Development Workflow
```bash
# 1. Start development server
npm run dev

# 2. In another terminal, run type checking
npm run type-check -- --watch

# 3. Optional: Run tests in watch mode
npm run test:watch
```

## IDE Configuration

### VS Code Setup

#### Recommended Extensions
Create `.vscode/extensions.json`:
```json
{
  "recommendations": [
    "svelte.svelte-vscode",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "tauri-apps.tauri-vscode",
    "rust-lang.rust-analyzer"
  ]
}
```

#### Workspace Settings
Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "svelte.enable-ts-plugin": true,
  "files.associations": {
    "*.svelte": "svelte"
  },
  "emmet.includeLanguages": {
    "svelte": "html"
  }
}
```

#### Debug Configuration
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Tauri Development Debug",
      "type": "lldb",
      "request": "launch",
      "program": "${workspaceFolder}/src-tauri/target/debug/coalition-desktop",
      "args": [],
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

### Other IDEs

#### WebStorm/IntelliJ
1. Enable Svelte plugin
2. Configure TypeScript service
3. Set up ESLint and Prettier integration

#### Vim/Neovim
Install relevant plugins:
- `coc-svelte` for Svelte support
- `coc-rust-analyzer` for Rust support
- `coc-tsserver` for TypeScript

## Troubleshooting

### Common Issues

#### Node.js Version Mismatch
```bash
# Error: Node version not supported
nvm use 22
npm install
```

#### Rust Compilation Errors
```bash
# Update Rust to latest version
rustup update

# Clear Rust cache
cargo clean
```

#### Tauri Build Failures

##### macOS: Code Signing Issues
```bash
# Skip code signing for development
export TAURI_SKIP_CODESIGN=true
npm run tauri build
```

##### Windows: Missing Visual Studio Tools
1. Install Visual Studio Build Tools 2019
2. Restart terminal
3. Try build again

##### Linux: Missing Dependencies
```bash
# Install all required packages
sudo apt install -y \
  libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

#### Port Already in Use
```bash
# Kill process using port 5173
npx kill-port 5173

# Or use different port
npm run dev -- --port 3000
```

#### Import Resolution Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors
```bash
# Restart TypeScript server in VS Code
# Command Palette (Cmd/Ctrl + Shift + P) > "TypeScript: Restart TS Server"

# Or run type check manually
npm run type-check
```

### Debug Mode

#### Enable Debug Logging
```bash
# Set environment variable
export VITE_ENABLE_DEBUG=true

# Or add to .env.local
echo "VITE_ENABLE_DEBUG=true" >> .env.local
```

#### Browser Debug Console
```javascript
// Access debug utilities in browser console
window.coalitionDesktop.debug.windows();
window.coalitionDesktop.debug.stores();
window.coalitionDesktop.debug.performance();
```

#### Rust Debug Output
```bash
# Enable Rust debug logging
export RUST_LOG=debug

# Run with debug output
npm run tauri dev
```

## Performance Optimization

### Development Performance

#### Reduce Bundle Size
```bash
# Analyze bundle
npm run build:analyze

# Check for large dependencies
npx bundle-analyzer dist/
```

#### Faster Builds
```bash
# Use SWC instead of Babel (if available)
# Configure in vite.config.js

# Enable incremental TypeScript compilation
# Configure in tsconfig.json
```

#### Memory Usage
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Run development server
npm run dev
```

## Docker Development (Optional)

### Dockerfile for Development
```dockerfile
FROM node:22-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
  build-base \
  curl \
  git

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host"]
```

### Docker Compose
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  coalition-desktop:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - VITE_ENABLE_DEBUG=true
```

### Usage
```bash
# Build and run
docker-compose -f docker-compose.dev.yml up

# Or run directly
docker build -t coalition-desktop .
docker run -p 5173:5173 -v $(pwd):/app coalition-desktop
```

## Next Steps

### After Setup
1. **Explore the codebase**: Start with `src/App.svelte` and `src/lib/components/`
2. **Run tests**: Ensure everything works with `npm test`
3. **Build the app**: Try `npm run build` and `npm run tauri build`
4. **Read documentation**: Check other docs in the `/docs` folder

### Development Workflow
1. **Create feature branch**: `git checkout -b feature/new-feature`
2. **Make changes**: Edit code, add tests
3. **Test changes**: `npm test` and manual testing
4. **Commit**: Follow conventional commit format
5. **Create PR**: Submit for review

### Getting Help
- **Documentation**: Check `/docs` folder for detailed guides
- **Issues**: Create GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Discord/Slack**: Check if there's a community channel

---

*This setup guide provides comprehensive instructions for getting coalition-desktop running in your development environment. Follow the steps carefully and refer to the troubleshooting section if you encounter any issues.*