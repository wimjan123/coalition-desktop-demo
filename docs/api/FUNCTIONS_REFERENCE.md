# Functions Reference - Coalition Desktop

## Overview

This document provides comprehensive API documentation for all functions, methods, and utilities available in the coalition-desktop project. Functions are organized by category and include detailed signatures, parameters, return values, and usage examples.

## Window Management Functions

### Core Window Operations

#### createWindow
Creates a new window with the specified parameters and adds it to the window store.

```typescript
function createWindow(
  title: string,
  component: any,
  options?: Partial<CreateWindowOptions>
): WindowData

interface CreateWindowOptions {
  x?: number;                    // Initial X position (default: cascade)
  y?: number;                    // Initial Y position (default: cascade)
  width?: number;                // Initial width (default: 800)
  height?: number;               // Initial height (default: 600)
  appId?: string;                // Associated application ID
  props?: Record<string, any>;   // Component props
  focused?: boolean;             // Initial focus state (default: true)
  resizable?: boolean;           // Can be resized (default: true)
  draggable?: boolean;           // Can be dragged (default: true)
  closable?: boolean;            // Can be closed (default: true)
}
```

**Example:**
```typescript
const window = createWindow('My App', MyComponent, {
  width: 1024,
  height: 768,
  appId: 'my-app',
  props: { userId: 123 }
});
```

#### closeWindow
Closes a window by ID and removes it from the window store.

```typescript
function closeWindow(id: string): void
```

**Example:**
```typescript
closeWindow('window-123');
```

#### focusWindow
Brings a window to focus and updates the z-order.

```typescript
function focusWindow(id: string): void
```

**Example:**
```typescript
focusWindow('window-123');
```

#### minimizeWindow
Minimizes or restores a window.

```typescript
function minimizeWindow(id: string, minimize?: boolean): void
```

**Example:**
```typescript
minimizeWindow('window-123', true);  // Minimize
minimizeWindow('window-123', false); // Restore
```

#### maximizeWindow
Maximizes or restores a window.

```typescript
function maximizeWindow(id: string, maximize?: boolean): void
```

**Example:**
```typescript
maximizeWindow('window-123', true);  // Maximize
maximizeWindow('window-123', false); // Restore
```

### Window State Management

#### updateWindowPosition
Updates the position of a window.

```typescript
function updateWindowPosition(
  id: string,
  x: number,
  y: number
): void
```

**Example:**
```typescript
updateWindowPosition('window-123', 100, 50);
```

#### updateWindowSize
Updates the size of a window.

```typescript
function updateWindowSize(
  id: string,
  width: number,
  height: number
): void
```

**Example:**
```typescript
updateWindowSize('window-123', 1024, 768);
```

#### updateWindowBounds
Updates both position and size of a window.

```typescript
function updateWindowBounds(
  id: string,
  bounds: WindowBounds
): void
```

**Example:**
```typescript
updateWindowBounds('window-123', {
  x: 100,
  y: 50,
  width: 1024,
  height: 768
});
```

### Window Queries

#### getWindow
Retrieves a window by ID.

```typescript
function getWindow(id: string): WindowData | null
```

**Example:**
```typescript
const window = getWindow('window-123');
if (window) {
  console.log(window.title);
}
```

#### getWindowsByApp
Retrieves all windows for a specific application.

```typescript
function getWindowsByApp(appId: string): WindowData[]
```

**Example:**
```typescript
const appWindows = getWindowsByApp('my-app');
console.log(`App has ${appWindows.length} windows`);
```

#### getFocusedWindow
Gets the currently focused window.

```typescript
function getFocusedWindow(): WindowData | null
```

**Example:**
```typescript
const focused = getFocusedWindow();
if (focused) {
  console.log(`Focused window: ${focused.title}`);
}
```

#### getWindowCount
Gets the total number of open windows.

```typescript
function getWindowCount(): number
```

**Example:**
```typescript
const count = getWindowCount();
console.log(`${count} windows open`);
```

## Drag and Drop Functions

### Drag System

#### useDrag
Initializes drag functionality for an element.

```typescript
function useDrag(
  element: HTMLElement,
  options?: DragOptions
): DragController

interface DragController {
  start: (event: PointerEvent) => void;
  stop: () => void;
  update: (options: Partial<DragOptions>) => void;
  destroy: () => void;
  getState: () => DragState;
}
```

**Example:**
```typescript
const dragController = useDrag(windowElement, {
  handle: '.title-bar',
  onDragMove: (x, y) => {
    updateWindowPosition(windowId, x, y);
  }
});
```

#### startDrag
Programmatically starts a drag operation.

```typescript
function startDrag(
  element: HTMLElement,
  event: PointerEvent,
  options?: DragOptions
): void
```

#### stopDrag
Stops the current drag operation.

```typescript
function stopDrag(): void
```

#### isDragging
Checks if any element is currently being dragged.

```typescript
function isDragging(): boolean
```

### Constraint Functions

#### constrainToParent
Constrains movement to parent element bounds.

```typescript
function constrainToParent(
  x: number,
  y: number,
  element: HTMLElement
): { x: number; y: number }
```

#### constrainToBounds
Constrains movement to specified bounds.

```typescript
function constrainToBounds(
  x: number,
  y: number,
  element: HTMLElement,
  bounds: DragBounds
): { x: number; y: number }
```

## Resize Functions

### Resize System

#### useResize
Initializes resize functionality for an element.

```typescript
function useResize(
  element: HTMLElement,
  options?: ResizeOptions
): ResizeController

interface ResizeController {
  start: (event: PointerEvent, direction: ResizeDirection) => void;
  stop: () => void;
  update: (options: Partial<ResizeOptions>) => void;
  destroy: () => void;
  getState: () => ResizeState;
  createHandles: () => HTMLElement[];
}
```

**Example:**
```typescript
const resizeController = useResize(windowElement, {
  minWidth: 300,
  minHeight: 200,
  onResizeMove: (bounds) => {
    updateWindowBounds(windowId, bounds);
  }
});
```

#### createResizeHandles
Creates resize handles for an element.

```typescript
function createResizeHandles(
  element: HTMLElement,
  directions?: ResizeDirection[]
): HTMLElement[]
```

#### calculateNewBounds
Calculates new bounds during resize operation.

```typescript
function calculateNewBounds(
  startBounds: WindowBounds,
  deltaX: number,
  deltaY: number,
  direction: ResizeDirection
): WindowBounds
```

### Size Validation

#### applyMinimumSize
Ensures bounds meet minimum size requirements.

```typescript
function applyMinimumSize(
  bounds: WindowBounds,
  minWidth: number,
  minHeight: number
): WindowBounds
```

#### applyMaximumSize
Ensures bounds don't exceed maximum size.

```typescript
function applyMaximumSize(
  bounds: WindowBounds,
  maxWidth: number,
  maxHeight: number
): WindowBounds
```

#### preserveAspectRatio
Adjusts bounds to maintain aspect ratio.

```typescript
function preserveAspectRatio(
  bounds: WindowBounds,
  aspectRatio: number,
  anchor?: 'width' | 'height'
): WindowBounds
```

## Snap Functions

### Snap Detection

#### snapToGrid
Snaps position to grid alignment.

```typescript
function snapToGrid(
  x: number,
  y: number,
  gridSize: number,
  threshold?: number
): { x: number; y: number; snapped: boolean }
```

**Example:**
```typescript
const result = snapToGrid(102, 98, 20, 10);
if (result.snapped) {
  updateWindowPosition(windowId, result.x, result.y);
}
```

#### snapToEdges
Snaps to screen edges.

```typescript
function snapToEdges(
  x: number,
  y: number,
  width: number,
  height: number,
  threshold?: number
): SnapResult
```

#### detectSnapZone
Detects which snap zone a position falls into.

```typescript
function detectSnapZone(
  x: number,
  y: number,
  screenWidth: number,
  screenHeight: number,
  threshold?: number
): string | null
```

**Returns:** Zone names like 'left-half', 'right-half', 'top-left-quarter', etc.

### Snap Zones

#### getSnapZones
Gets available snap zones for current screen.

```typescript
function getSnapZones(
  screenWidth: number,
  screenHeight: number
): SnapZone[]
```

#### createCustomSnapZone
Creates a custom snap zone.

```typescript
function createCustomSnapZone(
  name: string,
  bounds: WindowBounds,
  target: WindowBounds,
  priority?: number
): SnapZone
```

## Z-Order Functions

### Focus Management

#### bringToFront
Brings an element to the front of the z-order.

```typescript
function bringToFront(id: string): void
```

**Example:**
```typescript
bringToFront('window-123');
```

#### sendToBack
Sends an element to the back of the z-order.

```typescript
function sendToBack(id: string): void
```

#### getNextZIndex
Gets the next available z-index value.

```typescript
function getNextZIndex(): number
```

#### updateZOrder
Updates the z-order of all windows.

```typescript
function updateZOrder(): void
```

### Focus Utilities

#### cycleWindows
Cycles focus between open windows.

```typescript
function cycleWindows(direction?: 'forward' | 'backward'): void
```

**Example:**
```typescript
cycleWindows('forward');  // Alt+Tab behavior
cycleWindows('backward'); // Alt+Shift+Tab behavior
```

#### getFocusHistory
Gets the window focus history.

```typescript
function getFocusHistory(): string[]
```

## Toast Functions

### Toast Creation

#### showToast
Displays a toast notification.

```typescript
function showToast(
  message: string,
  type?: ToastType,
  options?: ToastOptions
): string
```

**Example:**
```typescript
const toastId = showToast('Operation completed!', 'success', {
  duration: 3000
});
```

#### showSuccess
Shows a success toast.

```typescript
function showSuccess(
  message: string,
  options?: ToastOptions
): string
```

#### showError
Shows an error toast.

```typescript
function showError(
  message: string,
  options?: ToastOptions
): string
```

#### showWarning
Shows a warning toast.

```typescript
function showWarning(
  message: string,
  options?: ToastOptions
): string
```

#### showInfo
Shows an info toast.

```typescript
function showInfo(
  message: string,
  options?: ToastOptions
): string
```

### Toast Management

#### dismissToast
Dismisses a specific toast.

```typescript
function dismissToast(id: string): void
```

#### dismissAllToasts
Dismisses all active toasts.

```typescript
function dismissAllToasts(): void
```

#### updateToast
Updates an existing toast.

```typescript
function updateToast(
  id: string,
  updates: Partial<ToastData>
): void
```

**Example:**
```typescript
updateToast(toastId, {
  message: 'Updated message',
  type: 'warning'
});
```

## Keyboard Functions

### Shortcut Management

#### registerShortcut
Registers a keyboard shortcut.

```typescript
function registerShortcut(
  combination: string,
  handler: ShortcutHandler,
  options?: ShortcutOptions
): string

interface ShortcutOptions {
  description?: string;
  global?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}
```

**Example:**
```typescript
const shortcutId = registerShortcut('cmd+w', () => {
  const focused = getFocusedWindow();
  if (focused) closeWindow(focused.id);
}, {
  description: 'Close window',
  global: true
});
```

#### unregisterShortcut
Unregisters a keyboard shortcut.

```typescript
function unregisterShortcut(id: string): void
```

#### getRegisteredShortcuts
Gets all registered shortcuts.

```typescript
function getRegisteredShortcuts(): Record<string, KeyboardShortcut>
```

### Platform Adaptation

#### adaptShortcutToPlatform
Adapts keyboard shortcuts to the current platform.

```typescript
function adaptShortcutToPlatform(
  shortcut: string
): string
```

**Example:**
```typescript
const adapted = adaptShortcutToPlatform('cmd+w');
// Returns 'ctrl+w' on Windows/Linux, 'cmd+w' on macOS
```

#### isMac
Checks if running on macOS.

```typescript
function isMac(): boolean
```

#### isWindows
Checks if running on Windows.

```typescript
function isWindows(): boolean
```

#### isLinux
Checks if running on Linux.

```typescript
function isLinux(): boolean
```

## Persistence Functions

### Data Persistence

#### saveLayout
Saves the current window layout.

```typescript
function saveLayout(): Promise<void>
```

**Example:**
```typescript
try {
  await saveLayout();
  showSuccess('Layout saved');
} catch (error) {
  showError('Failed to save layout');
}
```

#### loadLayout
Loads a previously saved layout.

```typescript
function loadLayout(): Promise<WindowData[]>
```

#### saveData
Saves arbitrary data with a key.

```typescript
function saveData(
  key: string,
  data: any,
  options?: SaveOptions
): Promise<void>

interface SaveOptions {
  compress?: boolean;
  encrypt?: boolean;
  backup?: boolean;
}
```

#### loadData
Loads data by key.

```typescript
function loadData<T>(
  key: string,
  defaultValue?: T
): Promise<T>
```

### Storage Management

#### clearStorage
Clears all stored data.

```typescript
function clearStorage(): Promise<void>
```

#### getStorageInfo
Gets storage usage information.

```typescript
function getStorageInfo(): Promise<StorageInfo>

interface StorageInfo {
  used: number;        // Bytes used
  available: number;   // Bytes available
  total: number;       // Total capacity
  keys: string[];      // Stored keys
}
```

## Utility Functions

### DOM Utilities

#### getElementBounds
Gets the bounding rectangle of an element.

```typescript
function getElementBounds(element: HTMLElement): WindowBounds
```

#### setElementBounds
Sets the position and size of an element.

```typescript
function setElementBounds(
  element: HTMLElement,
  bounds: WindowBounds,
  useTransform?: boolean
): void
```

#### getDesktopBounds
Gets the desktop area bounds.

```typescript
function getDesktopBounds(): WindowBounds
```

#### getViewportBounds
Gets the viewport bounds.

```typescript
function getViewportBounds(): WindowBounds
```

### ID Generation

#### generateId
Generates a unique ID.

```typescript
function generateId(prefix?: string): string
```

**Example:**
```typescript
const windowId = generateId('window');
// Returns: 'window-1234567890abc'
```

#### generateShortId
Generates a short unique ID.

```typescript
function generateShortId(): string
```

### Animation Utilities

#### requestAnimationFrame
Cross-browser requestAnimationFrame wrapper.

```typescript
function requestAnimationFrame(callback: FrameRequestCallback): number
```

#### cancelAnimationFrame
Cross-browser cancelAnimationFrame wrapper.

```typescript
function cancelAnimationFrame(id: number): void
```

#### throttle
Throttles function execution using RAF.

```typescript
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  enabled?: boolean
): T
```

#### debounce
Debounces function execution.

```typescript
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T
```

### Math Utilities

#### clamp
Clamps a value between min and max.

```typescript
function clamp(value: number, min: number, max: number): number
```

#### lerp
Linear interpolation between two values.

```typescript
function lerp(start: number, end: number, t: number): number
```

#### distance
Calculates distance between two points.

```typescript
function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number
```

#### rectIntersects
Checks if two rectangles intersect.

```typescript
function rectIntersects(
  rect1: WindowBounds,
  rect2: WindowBounds
): boolean
```

#### rectContains
Checks if a rectangle contains a point.

```typescript
function rectContains(
  rect: WindowBounds,
  x: number,
  y: number
): boolean
```

## Error Handling Functions

### Error Management

#### handleError
Global error handler.

```typescript
function handleError(
  error: Error | AppError,
  context?: string
): void
```

#### createAppError
Creates a formatted application error.

```typescript
function createAppError(
  code: string,
  message: string,
  details?: any
): AppError
```

#### isRecoverableError
Checks if an error is recoverable.

```typescript
function isRecoverableError(error: Error | AppError): boolean
```

### Validation Functions

#### validateWindowData
Validates window data structure.

```typescript
function validateWindowData(data: any): ValidationResult
```

#### validateToastData
Validates toast data structure.

```typescript
function validateToastData(data: any): ValidationResult
```

#### validateBounds
Validates window bounds.

```typescript
function validateBounds(bounds: any): ValidationResult
```

## Performance Functions

### Performance Monitoring

#### measurePerformance
Measures function execution time.

```typescript
function measurePerformance<T>(
  name: string,
  fn: () => T
): T
```

**Example:**
```typescript
const result = measurePerformance('window-creation', () => {
  return createWindow('Test', TestComponent);
});
```

#### getFrameRate
Gets the current frame rate.

```typescript
function getFrameRate(): number
```

#### getMemoryUsage
Gets memory usage information.

```typescript
function getMemoryUsage(): MemoryInfo | null

interface MemoryInfo {
  used: number;
  total: number;
  jsHeapSizeLimit: number;
}
```

### Optimization Utilities

#### batchUpdates
Batches multiple DOM updates.

```typescript
function batchUpdates(updates: (() => void)[]): void
```

#### scheduleWork
Schedules work to run when browser is idle.

```typescript
function scheduleWork(
  callback: () => void,
  options?: { timeout?: number }
): number
```

#### cancelWork
Cancels scheduled work.

```typescript
function cancelWork(id: number): void
```

## Development Functions

### Debug Utilities

#### debugWindow
Logs detailed window information.

```typescript
function debugWindow(id: string): void
```

#### debugStore
Logs current store state.

```typescript
function debugStore(storeName?: string): void
```

#### enableDebugMode
Enables debug mode with detailed logging.

```typescript
function enableDebugMode(enabled?: boolean): void
```

### Testing Utilities

#### createMockWindow
Creates mock window data for testing.

```typescript
function createMockWindow(
  overrides?: Partial<WindowData>
): WindowData
```

#### createMockToast
Creates mock toast data for testing.

```typescript
function createMockToast(
  overrides?: Partial<ToastData>
): ToastData
```

#### simulatePointerEvent
Simulates pointer events for testing.

```typescript
function simulatePointerEvent(
  type: string,
  target: Element,
  options?: PointerEventInit
): void
```

---

*This functions reference provides comprehensive documentation for all available functions in the coalition-desktop project, enabling developers to effectively utilize the application's API for window management, user interactions, and system integration.*