# Coalition Desktop

A satirical desktop environment built with Tauri v2, Svelte 5, and TypeScript. Experience a complete "desktop" interface inside a single application window, complete with draggable windows, a macOS-style dock, and window management features.

## 🚀 Features

### Core Window Management
- **Draggable Windows**: Smooth pointer-based dragging with viewport constraints
- **Multi-directional Resize**: 8-direction resize handles (N, S, E, W, NE, NW, SE, SW)
- **Z-order Management**: Click to focus, automatic z-index management
- **Snap-to-Grid**: Snap windows to screen edges, halves, and quarters
- **Window Controls**: Minimize, maximize/restore, and close functionality

### Desktop Environment
- **macOS-style Dock**: 7 satirical applications with hover animations
- **Toast Notifications**: Multi-type notification system with auto-dismiss
- **Window Lifecycle**: Complete minimize/restore/close window management
- **Focus Management**: Keyboard and mouse-driven window focus system

### Technical Architecture
- **Modern Stack**: Tauri v2 + Svelte 5 + TypeScript
- **Performance Optimized**: Pointer capture for smooth interactions
- **Type-Safe**: Full TypeScript implementation with strict types
- **Modular Design**: Clean separation of concerns across utilities and components

## 🛠️ Development Setup

### Prerequisites
- Node.js v22 LTS or higher
- Rust and Cargo (latest stable)
- Platform-specific dependencies for Tauri

### Installation
```bash
# Clone the repository
git clone https://github.com/wimjan123/coalition-desktop.git
cd coalition-desktop

# Install dependencies
npm install

# Start development server (web preview)
npm run dev

# Start Tauri development (native app)
npm run tauri:dev
```

### Available Scripts
- `npm run dev` - Start Vite development server (web preview)
- `npm run build` - Build for production
- `npm run tauri:dev` - Start Tauri development mode
- `npm run tauri:build` - Build native application
- `npm run preview` - Preview production build

## 📁 Project Structure

```
coalition-desktop/
├── src/                          # Frontend source code
│   ├── lib/
│   │   ├── components/           # Svelte components
│   │   │   ├── Desktop.svelte    # Main desktop container
│   │   │   ├── Window.svelte     # Window component with controls
│   │   │   ├── Dock.svelte       # macOS-style dock
│   │   │   └── Toasts.svelte     # Notification system
│   │   ├── stores/
│   │   │   └── stores.ts         # Svelte stores for state management
│   │   ├── types/
│   │   │   └── window.ts         # TypeScript interfaces
│   │   └── utils/                # Utility modules
│   │       ├── useDrag.ts        # Window dragging logic
│   │       ├── useResize.ts      # Window resizing logic
│   │       ├── snap.ts           # Snap-to-grid functionality
│   │       └── zorder.ts         # Z-index management
│   └── routes/
│       └── +page.svelte          # Application entry point
├── src-tauri/                    # Tauri backend
│   ├── src/
│   │   └── main.rs              # Rust main entry point
│   ├── Cargo.toml               # Rust dependencies
│   └── tauri.conf.json          # Tauri configuration
└── static/                      # Static assets
```

## 🎯 Architecture Overview

### Component Hierarchy
```
Desktop (main container)
├── Window[] (draggable windows)
│   ├── TitleBar (with controls)
│   ├── Content (slot for app content)
│   └── ResizeHandles (8-direction)
├── Dock (app launcher)
└── Toasts (notifications)
```

### State Management
- **windowsStore**: Array of WindowData objects
- **toastsStore**: Array of toast notifications
- **desktopStore**: Global desktop state (dragging, resizing, etc.)

### Key Algorithms
- **Drag System**: Pointer capture with viewport constraints
- **Resize System**: Multi-directional with minimum/maximum size enforcement
- **Snap Logic**: Edge/half/quarter screen positioning
- **Z-order**: Automatic focus management with click-to-front behavior

## 🎨 Satirical Applications

The dock includes 7 humorous applications:
1. **Complain-O-Matic** - Professional complaint generator
2. **Blame Shifter Pro** - Advanced responsibility delegation
3. **Meeting Multiplier** - Schedule conflicts optimizer
4. **Buzzword Bingo** - Corporate language generator
5. **Red Tape Generator** - Bureaucracy simulator
6. **Committee Creator** - Infinite committee generation
7. **Status Updater** - Automated status reporting

## 🚧 Roadmap

### Phase 1: Core Features ✅
- [x] Window management system
- [x] Drag and resize functionality
- [x] Dock and toast notifications
- [x] Satirical app stubs

### Phase 2: Enhanced Features 🔄
- [ ] Keyboard shortcuts (⌘W, ⌘`, Esc)
- [ ] Layout persistence via Tauri FS API
- [ ] Local JSON fixtures for app content
- [ ] Performance optimization pass

### Phase 3: Polish & Distribution 📋
- [ ] Accessibility improvements
- [ ] Unit tests for utility modules
- [ ] macOS .app build target
- [ ] Documentation and deployment

## 🧪 Testing

### Web Preview
```bash
npm run dev
# Visit http://localhost:5173
```

### Native Preview
```bash
npm run tauri:dev
# Native window will open automatically
```

### Production Build
```bash
npm run tauri:build
# Creates distributable app in src-tauri/target/release/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Tauri](https://tauri.app/) for native performance
- Powered by [Svelte 5](https://svelte.dev/) for reactive UI
- Inspired by classic desktop environments with a satirical twist