# Types Reference - Coalition Desktop

## Overview

This document provides comprehensive TypeScript type definitions for the coalition-desktop project. These interfaces define the data structures, component props, utility function signatures, and store schemas used throughout the application.

## Core Interfaces

### Window Management

#### WindowData
```typescript
interface WindowData {
  // Identification
  id: string;                    // Unique window identifier
  appId?: string;               // Associated application ID
  title: string;                // Window title displayed in title bar

  // Component
  component: any;               // Svelte component constructor
  props?: Record<string, any>;  // Props passed to component

  // Position and Size
  x: number;                    // X position in pixels
  y: number;                    // Y position in pixels
  width: number;                // Width in pixels
  height: number;               // Height in pixels

  // State
  zIndex: number;               // Stacking order
  focused: boolean;             // Has focus
  minimized: boolean;           // Is minimized
  maximized: boolean;           // Is maximized

  // Behavior flags
  resizable?: boolean;          // Can be resized (default: true)
  draggable?: boolean;          // Can be dragged (default: true)
  closable?: boolean;           // Can be closed (default: true)

  // Metadata
  lastFocusTime?: number;       // Last focus timestamp
  createTime?: number;          // Creation timestamp
  metadata?: Record<string, any>; // Additional data
}
```

#### WindowBounds
```typescript
interface WindowBounds {
  x: number;      // Left position
  y: number;      // Top position
  width: number;  // Width
  height: number; // Height
}
```

### Drag System

#### DragOptions
```typescript
interface DragOptions {
  // Event callbacks
  onDragStart?: (event: PointerEvent, element: HTMLElement) => void;
  onDragMove?: (x: number, y: number, event: PointerEvent) => void;
  onDragEnd?: (x: number, y: number, event: PointerEvent) => void;

  // Constraints
  bounds?: DragBounds | (() => DragBounds);
  constrainToParent?: boolean;
  snapThreshold?: number;

  // Performance
  throttle?: boolean;           // Enable RAF throttling (default: true)
  useTransform?: boolean;       // Use CSS transform vs position (default: true)

  // Behavior
  disabled?: boolean;           // Disable dragging
  handle?: string | HTMLElement; // Drag handle selector or element
  cursor?: string;              // Cursor during drag

  // Advanced
  momentum?: MomentumOptions;   // Momentum/inertia settings
  multiTouch?: boolean;         // Enable multi-touch gestures
}

interface DragBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface MomentumOptions {
  enabled: boolean;
  friction: number;             // Friction coefficient (0-1)
  threshold: number;            // Minimum velocity to apply momentum
}
```

#### DragState
```typescript
interface DragState {
  isDragging: boolean;
  startX: number;               // Initial pointer X
  startY: number;               // Initial pointer Y
  currentX: number;             // Current pointer X
  currentY: number;             // Current pointer Y
  deltaX: number;               // Total X movement
  deltaY: number;               // Total Y movement
  velocity: { x: number; y: number }; // Current velocity
  element: HTMLElement | null;
  pointerId: number | null;     // Captured pointer ID
}
```

### Resize System

#### ResizeOptions
```typescript
interface ResizeOptions {
  // Event callbacks
  onResizeStart?: (direction: ResizeDirection, event: PointerEvent) => void;
  onResizeMove?: (bounds: WindowBounds, direction: ResizeDirection) => void;
  onResizeEnd?: (bounds: WindowBounds, direction: ResizeDirection) => void;

  // Size constraints
  minWidth?: number;            // Minimum width in pixels
  minHeight?: number;           // Minimum height in pixels
  maxWidth?: number;            // Maximum width in pixels
  maxHeight?: number;           // Maximum height in pixels
  aspectRatio?: number | 'preserve'; // Aspect ratio constraint

  // Behavior
  handles?: ResizeDirection[];  // Enabled resize directions
  disabled?: boolean;           // Disable resizing
  snapToSize?: boolean;         // Snap to common sizes

  // Visual
  showHandles?: boolean;        // Show resize handles
  handleSize?: number;          // Handle size in pixels
  cursor?: Record<ResizeDirection, string>; // Cursor per direction
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
```

#### ResizeState
```typescript
interface ResizeState {
  isResizing: boolean;
  direction: ResizeDirection | null;
  startBounds: WindowBounds;
  currentBounds: WindowBounds;
  startPointer: { x: number; y: number };
  element: HTMLElement | null;
  pointerId: number | null;
}
```

### Notification System

#### ToastData
```typescript
interface ToastData {
  // Identification
  id: string;                   // Unique toast ID
  type: ToastType;             // Toast type

  // Content
  message: string;             // Main message
  title?: string;              // Optional title

  // Behavior
  duration: number;            // Auto-dismiss time (0 = persistent)
  dismissible?: boolean;       // Can be manually dismissed

  // Metadata
  timestamp: number;           // Creation timestamp
  action?: ToastAction;        // Optional action button
  metadata?: Record<string, any>; // Additional data
}

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastAction {
  label: string;               // Button text
  handler: () => void;         // Click handler
  style?: 'primary' | 'secondary'; // Button style
  disabled?: boolean;          // Button state
}
```

#### ToastOptions
```typescript
interface ToastOptions {
  title?: string;
  duration?: number;           // Override default duration
  dismissible?: boolean;
  action?: ToastAction;
  metadata?: Record<string, any>;
}
```

### Application System

#### Application
```typescript
interface Application {
  // Identification
  id: string;                  // Unique application ID
  title: string;               // Display name

  // Visual
  icon: string;                // Icon (emoji or URL)
  description: string;         // Tooltip description

  // Component
  component: () => Promise<{ default: any }>; // Dynamic import function
  defaultProps?: Record<string, any>; // Default component props

  // State
  isRunning?: boolean;         // Has running windows
  windowCount?: number;        // Number of open windows
  isFocused?: boolean;         // Has focused window

  // Metadata
  category?: string;           // Application category
  version?: string;           // Application version
  author?: string;            // Application author
}
```

### Snap System

#### SnapOptions
```typescript
interface SnapOptions {
  threshold: number;           // Snap detection threshold in pixels
  showGuides?: boolean;        // Show visual snap guides
  edges?: boolean;             // Enable edge snapping
  grid?: boolean;              // Enable grid snapping
  windows?: boolean;           // Enable window-to-window snapping

  // Grid settings
  gridSize?: number;           // Grid cell size in pixels

  // Edge zones
  edgeZones?: SnapZone[];      // Custom edge snap zones
}

interface SnapZone {
  name: string;                // Zone identifier
  bounds: WindowBounds;        // Zone boundaries
  target: WindowBounds;        // Target position/size
  priority: number;            // Snap priority (higher = preferred)
}

interface SnapResult {
  x: number;                   // Snapped X position
  y: number;                   // Snapped Y position
  width?: number;              // Snapped width (if size snap)
  height?: number;             // Snapped height (if size snap)
  zone?: string;               // Matched zone name
  snapped: boolean;            // Whether snapping occurred
}
```

### Keyboard System

#### KeyboardOptions
```typescript
interface KeyboardOptions {
  // Global shortcuts
  globalShortcuts?: Record<string, KeyboardShortcut>;

  // Behavior
  preventDefault?: boolean;     // Prevent default browser behavior
  stopPropagation?: boolean;   // Stop event propagation
  disabled?: boolean;          // Disable keyboard handling

  // Platform adaptation
  adaptToPlatform?: boolean;   // Auto-adapt shortcuts to platform
}

interface KeyboardShortcut {
  key: string;                 // Key combination (e.g., 'cmd+w', 'ctrl+shift+n')
  handler: (event: KeyboardEvent) => void;
  description?: string;        // Human-readable description
  global?: boolean;            // Global vs element-specific
  disabled?: boolean;          // Temporarily disable
}

interface KeyboardState {
  pressedKeys: Set<string>;    // Currently pressed keys
  activeShortcuts: Map<string, KeyboardShortcut>; // Registered shortcuts
  isComposing: boolean;        // IME composition state
}
```

### Persistence System

#### PersistenceOptions
```typescript
interface PersistenceOptions {
  // Storage
  key: string;                 // Storage key
  storageType?: 'localStorage' | 'sessionStorage' | 'tauri';

  // Behavior
  autoSave?: boolean;          // Auto-save on changes
  saveDelay?: number;          // Debounce delay for auto-save

  // Validation
  validator?: (data: any) => boolean; // Data validation function
  version?: string;            // Data format version
}

interface PersistenceState {
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: number | null;    // Last save timestamp
  error: string | null;        // Last error message
}
```

### Desktop System

#### DesktopState
```typescript
interface DesktopState {
  // Global interaction state
  isDragging: boolean;
  isResizing: boolean;
  activeOperation: OperationType;

  // Desktop properties
  bounds: WindowBounds;        // Desktop boundaries
  scale: number;               // Display scale factor

  // Focus management
  focusedWindowId: string | null;
  focusHistory: string[];      // Window focus history

  // Visual state
  showGrid?: boolean;          // Grid overlay visibility
  snapGuides: SnapGuide[];     // Active snap guides

  // Performance
  frameRate: number;           // Current frame rate
  memoryUsage?: number;        // Memory usage in MB
}

type OperationType = 'none' | 'drag' | 'resize' | 'select' | 'snap';

interface SnapGuide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  bounds: { start: number; end: number };
  visible: boolean;
}
```

## Utility Function Types

### Event Handlers

#### PointerEventHandler
```typescript
type PointerEventHandler = (event: PointerEvent) => void;

type DragEventHandler = (
  x: number,
  y: number,
  event: PointerEvent
) => void;

type ResizeEventHandler = (
  bounds: WindowBounds,
  direction: ResizeDirection
) => void;
```

#### KeyboardEventHandler
```typescript
type KeyboardEventHandler = (event: KeyboardEvent) => void;

type ShortcutHandler = (event: KeyboardEvent) => void | boolean;
```

### Store Types

#### Store Definitions
```typescript
// Window store
type WindowsStore = Writable<WindowData[]>;

// Toast store
type ToastsStore = Writable<ToastData[]>;

// Desktop store
type DesktopStore = Writable<DesktopState>;

// Derived stores
type FocusedWindowStore = Readable<WindowData | null>;
type WindowCountStore = Readable<number>;
type IsAnyWindowDraggingStore = Readable<boolean>;
```

### Component Props

#### Window Component Props
```typescript
interface WindowProps {
  data: WindowData;            // Required window data

  // Behavior overrides
  resizable?: boolean;
  draggable?: boolean;
  closable?: boolean;

  // Event handlers
  onFocus?: (id: string) => void;
  onClose?: (id: string) => void;
  onMinimize?: (id: string) => void;
  onMaximize?: (id: string) => void;

  // Styling
  className?: string;
  style?: string;
}
```

#### Dock Component Props
```typescript
interface DockProps {
  applications?: Application[]; // Available applications

  // State
  runningApps?: string[];      // Currently running app IDs
  focusedApp?: string;         // Currently focused app ID

  // Event handlers
  onLaunchApp?: (appId: string) => void;
  onFocusApp?: (appId: string) => void;
  onCloseApp?: (appId: string) => void;

  // Behavior
  autoHide?: boolean;          // Auto-hide when not in use
  position?: 'bottom' | 'top' | 'left' | 'right';

  // Styling
  size?: 'small' | 'medium' | 'large';
  theme?: 'light' | 'dark' | 'auto';
}
```

#### Toast Component Props
```typescript
interface ToastProps {
  toast: ToastData;            // Required toast data

  // Behavior overrides
  dismissible?: boolean;
  pauseOnHover?: boolean;

  // Event handlers
  onDismiss?: (id: string) => void;
  onAction?: (action: ToastAction) => void;

  // Animation
  animationType?: 'slide' | 'fade' | 'scale';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}
```

## Configuration Types

### Application Configuration
```typescript
interface AppConfig {
  // Application metadata
  name: string;
  version: string;
  description: string;

  // Window defaults
  defaultWindow: Partial<WindowData>;

  // Behavior settings
  persistence: PersistenceOptions;
  keyboard: KeyboardOptions;
  performance: PerformanceOptions;

  // Visual settings
  theme: ThemeConfig;
  animations: AnimationConfig;
}

interface PerformanceOptions {
  targetFrameRate: number;     // Target FPS
  enableGPUAcceleration: boolean;
  throttlePointerEvents: boolean;
  maxWindows: number;          // Maximum concurrent windows
  memoryThreshold: number;     // Memory usage warning threshold
}

interface ThemeConfig {
  primary: string;             // Primary color
  secondary: string;           // Secondary color
  background: string;          // Desktop background
  windowBackground: string;    // Window background
  fontFamily: string;          // Font family
  fontSize: number;            // Base font size
}

interface AnimationConfig {
  duration: number;            // Default animation duration
  easing: string;              // Default easing function
  enableAnimations: boolean;   // Global animation toggle
  reducedMotion: boolean;      // Respect prefers-reduced-motion
}
```

### Build Configuration
```typescript
interface BuildConfig {
  // Target platforms
  targets: Platform[];

  // Bundle options
  minify: boolean;
  sourceMaps: boolean;
  treeshaking: boolean;

  // Assets
  publicPath: string;
  assetPrefix: string;

  // Development
  devServer: DevServerConfig;
  hotReload: boolean;
}

type Platform = 'web' | 'tauri' | 'electron' | 'mobile';

interface DevServerConfig {
  port: number;
  host: string;
  https: boolean;
  proxy?: Record<string, string>;
}
```

## Error Types

### Error Handling
```typescript
interface AppError {
  code: string;                // Error code
  message: string;             // Human-readable message
  details?: any;               // Additional error details
  timestamp: number;           // Error timestamp
  stack?: string;              // Stack trace
  recoverable: boolean;        // Can the app recover from this error
}

type ErrorHandler = (error: AppError) => void;

interface ErrorBoundaryProps {
  fallback?: (error: AppError) => any; // Fallback component
  onError?: ErrorHandler;      // Error callback
  resetOnPropsChange?: boolean; // Reset error state on prop changes
}
```

### Validation Types
```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}

interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

type Validator<T> = (value: T) => ValidationResult;
```

## Async Operation Types

### Promise Utilities
```typescript
interface AsyncOperation<T> {
  promise: Promise<T>;
  cancel: () => void;
  isCompleted: boolean;
  isCancelled: boolean;
}

interface LoadingState<T> {
  isLoading: boolean;
  data: T | null;
  error: AppError | null;
  lastUpdated: number | null;
}

type AsyncHandler<T> = () => Promise<T>;
```

### File Operations
```typescript
interface FileOperationOptions {
  encoding?: 'utf8' | 'base64';
  backup?: boolean;           // Create backup before write
  atomic?: boolean;           // Atomic write operation
}

interface FileMetadata {
  path: string;
  size: number;
  modified: number;
  created: number;
  permissions: string;
}
```

## Type Guards

### Runtime Type Checking
```typescript
// Type guard functions for runtime validation
function isWindowData(obj: any): obj is WindowData {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.x === 'number' &&
    typeof obj.y === 'number' &&
    typeof obj.width === 'number' &&
    typeof obj.height === 'number';
}

function isToastData(obj: any): obj is ToastData {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.message === 'string' &&
    typeof obj.type === 'string' &&
    ['success', 'error', 'warning', 'info'].includes(obj.type);
}

function isApplication(obj: any): obj is Application {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.icon === 'string' &&
    typeof obj.component === 'function';
}
```

## Export Declarations

### Main Exports
```typescript
// Primary types exported from the module
export type {
  // Core interfaces
  WindowData,
  WindowBounds,
  ToastData,
  ToastAction,
  Application,

  // System interfaces
  DragOptions,
  DragState,
  ResizeOptions,
  ResizeState,
  SnapOptions,
  SnapResult,

  // Component props
  WindowProps,
  DockProps,
  ToastProps,

  // Configuration
  AppConfig,
  BuildConfig,

  // Utilities
  AppError,
  ValidationResult,
  AsyncOperation,
  LoadingState
};

// Type guards
export {
  isWindowData,
  isToastData,
  isApplication
};

// Constants
export const RESIZE_DIRECTIONS: ResizeDirection[] = [
  'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'
];

export const TOAST_TYPES: ToastType[] = [
  'success', 'error', 'warning', 'info'
];
```

---

*This types reference provides comprehensive TypeScript definitions for all data structures and interfaces used throughout the coalition-desktop application, ensuring type safety and excellent developer experience.*