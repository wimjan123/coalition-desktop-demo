# Coalition Desktop Documentation Index

A comprehensive documentation system for the coalition-desktop project - a satirical desktop environment built with Tauri v2 + Svelte 5 + TypeScript.

## Table of Contents

1. [Project Overview & Architecture](#project-overview--architecture)
2. [Component Documentation](#component-documentation)
3. [Utility Modules](#utility-modules)
4. [API Reference](#api-reference)
5. [Development Guide](#development-guide)
6. [Feature Documentation](#feature-documentation)
7. [Cross-References](#cross-references)

---

## Project Overview & Architecture

### [PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md)
- **Tech Stack**: Tauri v2, Svelte 5, TypeScript, SvelteKit
- **Project Structure**: Frontend/backend architecture with Rust + JavaScript
- **Design Patterns**: Event-driven, reactive state management, component composition
- **Performance Targets**: 60fps animations, <100ms UI response, RAF optimization

### [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **System Design**: Multi-layer architecture with clear separation of concerns
- **State Management**: Reactive stores with computed properties
- **Event Handling**: Pointer capture system with advanced drag/resize logic
- **Cross-Platform Strategy**: Environment detection with graceful degradation

---

## Component Documentation

### Core Components

#### [Desktop.svelte](./docs/components/DESKTOP.md)
- **Purpose**: Main container and desktop environment orchestrator
- **Responsibilities**: Layout management, global event coordination, window lifecycle
- **State**: Desktop-level configuration, background management
- **Integration**: Central hub connecting all desktop subsystems

#### [Window.svelte](./docs/components/WINDOW.md)
- **Purpose**: Individual draggable, resizable application windows
- **Features**: 8-direction resize handles, snap-to-grid, z-order management
- **API**: WindowData interface, focus management, lifecycle events
- **Performance**: GPU-accelerated transforms, throttled pointer events

#### [Dock.svelte](./docs/components/DOCK.md)
- **Purpose**: macOS-style application launcher with satirical applications
- **Applications**: 7 satirical desktop applications with unique icons and behaviors
- **Interactions**: Hover effects, launch animations, application state management
- **Styling**: CSS transforms, responsive design, accessibility features

#### [Toasts.svelte](./docs/components/TOASTS.md)
- **Purpose**: System-wide notification management
- **Types**: Success, error, warning, info notifications
- **Features**: Auto-dismiss timers, manual close, queue management
- **Animation**: Smooth enter/exit transitions, stacking behavior

---

## Utility Modules

### Window Management

#### [useDrag.ts](./docs/utils/USE_DRAG.md)
- **Purpose**: Advanced drag system with pointer capture
- **Features**: Multi-pointer support, boundary constraints, snap detection
- **Performance**: RAF throttling, CSS transform optimization
- **API**: `startDrag()`, `stopDrag()`, drag state management

#### [useResize.ts](./docs/utils/USE_RESIZE.md)
- **Purpose**: 8-direction window resizing with handle detection
- **Handles**: N, S, E, W, NE, NW, SE, SW resize directions
- **Constraints**: Minimum size enforcement, boundary checking
- **API**: `startResize()`, `stopResize()`, handle event delegation

#### [snap.ts](./docs/utils/SNAP.md)
- **Purpose**: Intelligent window positioning and snap-to-grid logic
- **Features**: Edge snap, half-screen, quarter-screen positioning
- **Detection**: Screen boundary analysis, snap threshold configuration
- **API**: `snapToGrid()`, `detectSnapZone()`, position calculations

#### [zorder.ts](./docs/utils/ZORDER.md)
- **Purpose**: Window layering and focus management
- **Algorithm**: Click-to-focus with automatic z-index assignment
- **Performance**: Efficient z-index calculation, minimal DOM manipulation
- **API**: `bringToFront()`, `sendToBack()`, focus state management

### System Integration

#### [usePersistence.ts](./docs/utils/USE_PERSISTENCE.md)
- **Purpose**: Layout persistence via Tauri FS API
- **Features**: Save/restore window positions, cross-platform compatibility
- **Fallback**: Graceful degradation for web preview mode
- **API**: `saveLayout()`, `restoreLayout()`, error handling

#### [useKeyboard.ts](./docs/utils/USE_KEYBOARD.md)
- **Purpose**: Global keyboard shortcut management
- **Shortcuts**: ⌘W (close window), ⌘` (cycle windows), Esc (cancel operations)
- **Platform**: macOS-style shortcuts with Windows/Linux alternatives
- **API**: `registerShortcut()`, `unregisterShortcut()`, event delegation

---

## API Reference

### [TYPES_REFERENCE.md](./docs/api/TYPES_REFERENCE.md)

#### Core Interfaces
```typescript
interface WindowData {
  id: string;
  title: string;
  component: any;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  focused: boolean;
  minimized: boolean;
}

interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration: number;
  timestamp: number;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  elementX: number;
  elementY: number;
}
```

### [STORES_REFERENCE.md](./docs/api/STORES_REFERENCE.md)

#### State Management
```typescript
// Window management store
const windowsStore: Writable<WindowData[]>

// Toast notification store
const toastsStore: Writable<ToastData[]>

// Desktop global state
const desktopStore: Writable<DesktopState>
```

### [FUNCTIONS_REFERENCE.md](./docs/api/FUNCTIONS_REFERENCE.md)

#### Core Functions
- `createWindow(title: string, component: any): WindowData`
- `closeWindow(id: string): void`
- `focusWindow(id: string): void`
- `showToast(message: string, type: ToastType): void`
- `saveLayout(): Promise<void>`
- `restoreLayout(): Promise<WindowData[]>`

---

## Development Guide

### [SETUP_GUIDE.md](./docs/development/SETUP_GUIDE.md)
- **Prerequisites**: Node.js v22 LTS, Rust, Tauri CLI
- **Installation**: Project setup, dependency management
- **Environment**: Development vs production configuration
- **Troubleshooting**: Common setup issues and solutions

### [BUILD_PROCESSES.md](./docs/development/BUILD_PROCESSES.md)
- **Development Server**: `npm run dev` for hot-reload development
- **Web Preview**: `npm run preview` for web-only testing
- **Tauri Build**: `npm run tauri dev` for native development
- **Production**: Build targets, distribution, deployment

### [DEVELOPMENT_WORKFLOW.md](./docs/development/DEVELOPMENT_WORKFLOW.md)
- **Git Strategy**: Feature branches, commit conventions
- **Testing**: Component testing, utility testing, E2E testing
- **Performance**: Profiling, optimization, monitoring
- **Debugging**: Browser DevTools, Tauri debugging, log analysis

### [CONTRIBUTION_GUIDE.md](./docs/development/CONTRIBUTION_GUIDE.md)
- **Code Standards**: TypeScript strict mode, ESLint configuration
- **Component Guidelines**: Svelte 5 patterns, prop conventions
- **Testing Requirements**: Coverage expectations, test patterns
- **Review Process**: PR templates, review checklist

---

## Feature Documentation

### [WINDOW_MANAGEMENT.md](./docs/features/WINDOW_MANAGEMENT.md)
- **Drag System**: Advanced pointer capture with multi-touch support
- **Resize Functionality**: 8-direction handles with visual feedback
- **Snap Behavior**: Edge detection, grid alignment, visual guides
- **Z-Order Management**: Click-to-focus, layering algorithms
- **Keyboard Navigation**: Shortcuts, accessibility, focus management

### [LAYOUT_PERSISTENCE.md](./docs/features/LAYOUT_PERSISTENCE.md)
- **Save Mechanism**: Tauri FS API integration, JSON serialization
- **Restore Logic**: Window recreation, position validation
- **Cross-Platform**: Web fallback, environment detection
- **Error Handling**: Graceful degradation, user feedback

### [TOAST_SYSTEM.md](./docs/features/TOAST_SYSTEM.md)
- **Notification Types**: Success, error, warning, info variants
- **Queue Management**: FIFO queue with priority handling
- **Auto-Dismiss**: Configurable timers, user interaction
- **Accessibility**: Screen reader support, keyboard navigation

### [KEYBOARD_SHORTCUTS.md](./docs/features/KEYBOARD_SHORTCUTS.md)
- **Global Shortcuts**: System-wide key combinations
- **Window Shortcuts**: Per-window key handling
- **Platform Adaptation**: macOS, Windows, Linux key mapping
- **Customization**: User-configurable shortcut system

### [PERFORMANCE_OPTIMIZATION.md](./docs/features/PERFORMANCE_OPTIMIZATION.md)
- **Animation Performance**: 60fps targets, RAF throttling
- **Memory Management**: Component lifecycle, store cleanup
- **Rendering Optimization**: CSS transforms, GPU acceleration
- **Bundle Optimization**: Code splitting, tree shaking

---

## Cross-References

### Component Dependencies
```
Desktop.svelte
├── Window.svelte (uses: useDrag, useResize, snap, zorder)
├── Dock.svelte (uses: windowsStore)
└── Toasts.svelte (uses: toastsStore)
```

### Utility Interdependencies
```
useDrag.ts → snap.ts (snap detection)
useResize.ts → zorder.ts (focus management)
usePersistence.ts → windowsStore (state serialization)
useKeyboard.ts → windowsStore, toastsStore (action dispatch)
```

### Store Relationships
```
windowsStore ← useDrag, useResize, useKeyboard
toastsStore ← useKeyboard, error handlers
desktopStore ← Desktop.svelte, usePersistence
```

### API Flow Diagrams
```
User Action → Event Handler → Utility Function → Store Update → Component Re-render
```

---

## Quick Navigation

### By Feature
- **Window Operations**: [Window.svelte](./docs/components/WINDOW.md) + [useDrag.ts](./docs/utils/USE_DRAG.md) + [useResize.ts](./docs/utils/USE_RESIZE.md)
- **Layout Persistence**: [usePersistence.ts](./docs/utils/USE_PERSISTENCE.md) + [windowsStore](./docs/api/STORES_REFERENCE.md)
- **Keyboard Shortcuts**: [useKeyboard.ts](./docs/utils/USE_KEYBOARD.md) + [Global Shortcuts](./docs/features/KEYBOARD_SHORTCUTS.md)
- **Notifications**: [Toasts.svelte](./docs/components/TOASTS.md) + [toastsStore](./docs/api/STORES_REFERENCE.md)

### By Development Task
- **New Component**: [Component Guidelines](./docs/development/CONTRIBUTION_GUIDE.md) + [Desktop.svelte](./docs/components/DESKTOP.md)
- **New Utility**: [Utility Patterns](./docs/utils/) + [API Reference](./docs/api/)
- **Performance Tuning**: [Performance Guide](./docs/features/PERFORMANCE_OPTIMIZATION.md) + [Build Processes](./docs/development/BUILD_PROCESSES.md)
- **Testing**: [Testing Strategy](./docs/development/DEVELOPMENT_WORKFLOW.md) + [Component Testing](./docs/development/CONTRIBUTION_GUIDE.md)

### By Maintenance Task
- **Bug Investigation**: [Debugging Guide](./docs/development/DEVELOPMENT_WORKFLOW.md) + [Architecture](./docs/ARCHITECTURE.md)
- **Feature Enhancement**: [API Reference](./docs/api/) + [Feature Documentation](./docs/features/)
- **Performance Issues**: [Performance Optimization](./docs/features/PERFORMANCE_OPTIMIZATION.md) + [Profiling](./docs/development/DEVELOPMENT_WORKFLOW.md)
- **Cross-Platform Issues**: [Setup Guide](./docs/development/SETUP_GUIDE.md) + [Persistence](./docs/features/LAYOUT_PERSISTENCE.md)

---

## Documentation Standards

### File Organization
- **Logical Grouping**: Components, utilities, API, development, features
- **Consistent Naming**: UPPERCASE.md for major sections, descriptive names
- **Cross-Reference Links**: Bidirectional navigation between related topics
- **Code Examples**: TypeScript snippets with proper syntax highlighting

### Content Structure
- **Purpose Statement**: Clear explanation of each module's role
- **API Documentation**: Function signatures, parameters, return types
- **Usage Examples**: Practical code snippets and integration patterns
- **Related Topics**: Links to dependencies and related functionality

### Maintenance
- **Version Sync**: Documentation updates with code changes
- **Link Validation**: Regular verification of cross-references
- **Example Testing**: Ensure code examples remain functional
- **Accessibility**: Screen reader friendly formatting and structure

---

*This documentation index provides comprehensive coverage of the coalition-desktop project architecture, implementation details, and development workflows. Each linked document contains detailed technical information for developers and maintainers.*