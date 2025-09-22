# System Architecture - Coalition Desktop

## Overview

Coalition Desktop implements a multi-layer architecture that separates concerns between presentation, business logic, and system integration. The design emphasizes performance, maintainability, and cross-platform compatibility while providing a rich desktop-like user experience.

## Architectural Layers

### 1. Presentation Layer (Svelte Components)
```
┌─────────────────────────────────────────┐
│            Presentation Layer           │
├─────────────────────────────────────────┤
│ Desktop.svelte (Main Container)         │
│ ├── Window.svelte[] (Dynamic Windows)   │
│ ├── Dock.svelte (Application Launcher)  │
│ └── Toasts.svelte (Notifications)       │
└─────────────────────────────────────────┘
```

**Responsibilities:**
- User interface rendering and interaction
- Event handling and user input processing
- Visual feedback and animation management
- Component lifecycle and state binding

### 2. Business Logic Layer (TypeScript Utilities)
```
┌─────────────────────────────────────────┐
│           Business Logic Layer          │
├─────────────────────────────────────────┤
│ Window Management:                      │
│ ├── useDrag.ts (Drag Operations)        │
│ ├── useResize.ts (Resize Operations)    │
│ ├── snap.ts (Positioning Logic)         │
│ └── zorder.ts (Layering Management)     │
│                                         │
│ System Integration:                     │
│ ├── usePersistence.ts (Data Storage)    │
│ └── useKeyboard.ts (Input Handling)     │
└─────────────────────────────────────────┘
```

**Responsibilities:**
- Window management algorithms and calculations
- State transformation and business rules
- Cross-platform abstraction and compatibility
- Performance optimization and caching

### 3. State Management Layer (Svelte Stores)
```
┌─────────────────────────────────────────┐
│          State Management Layer         │
├─────────────────────────────────────────┤
│ windowsStore: Writable<WindowData[]>    │
│ toastsStore: Writable<ToastData[]>      │
│ desktopStore: Writable<DesktopState>    │
└─────────────────────────────────────────┘
```

**Responsibilities:**
- Centralized application state management
- Reactive data propagation to components
- State persistence and restoration
- Cross-component communication

### 4. System Integration Layer (Tauri APIs)
```
┌─────────────────────────────────────────┐
│        System Integration Layer         │
├─────────────────────────────────────────┤
│ File System API (Layout Persistence)    │
│ Window API (Native Window Management)   │
│ Event API (System Event Handling)       │
│ Platform API (OS-Specific Features)     │
└─────────────────────────────────────────┘
```

**Responsibilities:**
- Native system API integration
- File system operations and data persistence
- Operating system feature access
- Platform-specific optimizations

## Data Flow Architecture

### Unidirectional Data Flow
```
User Input → Event Handler → Utility Function → Store Update → Component Re-render
     ↑                                                            ↓
     └──────────────── Visual Feedback ←─────────────────────────┘
```

### Example: Window Drag Operation
```typescript
// 1. User Input (Mouse Down)
onPointerDown(event) →

// 2. Event Handler (Window Component)
startDrag(event) →

// 3. Utility Function (useDrag.ts)
updateDragState(position) →

// 4. Store Update (windowsStore)
windowsStore.update(windows =>
  windows.map(w => w.id === id ? {...w, x, y} : w)
) →

// 5. Component Re-render (Reactive)
$: style = `transform: translate(${window.x}px, ${window.y}px)`
```

## Component Architecture

### Desktop Container Pattern
```typescript
// Desktop.svelte - Container Component
export let windows: WindowData[] = [];
export let toasts: ToastData[] = [];

// Orchestrates child components
{#each $windowsStore as window (window.id)}
  <Window bind:data={window} />
{/each}

<Dock {windows} />
<Toasts bind:toasts={$toastsStore} />
```

### Window Component Architecture
```typescript
// Window.svelte - Self-Contained Window Management
export let data: WindowData;

// Import utilities for functionality
import { useDrag } from '../utils/useDrag.js';
import { useResize } from '../utils/useResize.js';
import { snap } from '../utils/snap.js';
import { bringToFront } from '../utils/zorder.js';

// Coordinate multiple utilities
const handlePointerDown = (event) => {
  if (isResizeHandle(event.target)) {
    startResize(event, data);
  } else {
    startDrag(event, data);
    bringToFront(data.id);
  }
};
```

## State Management Architecture

### Store Composition Pattern
```typescript
// stores.ts - Centralized State Management
import { writable, derived } from 'svelte/store';

// Primary stores
export const windowsStore = writable<WindowData[]>([]);
export const toastsStore = writable<ToastData[]>([]);
export const desktopStore = writable<DesktopState>({
  isDragging: false,
  isResizing: false,
  snapGuides: []
});

// Derived computed state
export const focusedWindow = derived(
  windowsStore,
  $windows => $windows.find(w => w.focused)
);

export const windowCount = derived(
  windowsStore,
  $windows => $windows.length
);
```

### Reactive State Updates
```typescript
// Utility functions update stores reactively
export const createWindow = (title: string, component: any) => {
  const newWindow: WindowData = {
    id: generateId(),
    title,
    component,
    x: 100,
    y: 100,
    width: 800,
    height: 600,
    zIndex: getNextZIndex(),
    focused: true,
    minimized: false
  };

  windowsStore.update(windows => {
    // Unfocus other windows
    const updated = windows.map(w => ({ ...w, focused: false }));
    return [...updated, newWindow];
  });
};
```

## Performance Architecture

### Event Optimization Strategy
```typescript
// RAF throttling for smooth performance
let rafId: number | null = null;

const throttledPointerMove = (event: PointerEvent) => {
  if (rafId !== null) return;

  rafId = requestAnimationFrame(() => {
    processPointerMove(event);
    rafId = null;
  });
};

// GPU-accelerated transforms
const updateWindowPosition = (x: number, y: number) => {
  // Use transform instead of top/left for hardware acceleration
  element.style.transform = `translate(${x}px, ${y}px)`;
};
```

### Memory Management
```typescript
// Component cleanup patterns
import { onDestroy } from 'svelte';

let cleanup: (() => void)[] = [];

onMount(() => {
  // Setup event listeners
  const unsubscribe = windowsStore.subscribe(handleWindowsChange);
  cleanup.push(unsubscribe);
});

onDestroy(() => {
  // Cleanup all subscriptions and listeners
  cleanup.forEach(fn => fn());
  cleanup = [];
});
```

## Cross-Platform Architecture

### Environment Detection Pattern
```typescript
// platform.ts - Platform abstraction layer
export const platform = {
  isTauri: typeof window !== 'undefined' && window.__TAURI__,
  isWeb: typeof window !== 'undefined' && !window.__TAURI__,
  isMac: navigator.platform.includes('Mac'),
  isWindows: navigator.platform.includes('Win'),
  isLinux: navigator.platform.includes('Linux')
};

// Conditional API usage
export const saveData = async (key: string, data: any) => {
  if (platform.isTauri) {
    const { writeTextFile } = await import('@tauri-apps/api/fs');
    await writeTextFile(`${key}.json`, JSON.stringify(data));
  } else {
    localStorage.setItem(key, JSON.stringify(data));
  }
};
```

### Graceful Degradation
```typescript
// Feature detection with fallbacks
export const initializePersistence = async () => {
  try {
    if (platform.isTauri) {
      // Full persistence with file system
      return new TauriPersistence();
    } else {
      // Limited persistence with localStorage
      return new WebPersistence();
    }
  } catch (error) {
    console.warn('Persistence unavailable, using memory only');
    return new MemoryPersistence();
  }
};
```

## Security Architecture

### Tauri Security Model
```json
// tauri.conf.json - Security configuration
{
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "scope": ["$APPDATA/*", "$APPLOCAL/*"]
      },
      "window": {
        "all": false,
        "create": false,
        "center": true,
        "requestUserAttention": true
      }
    }
  }
}
```

### Content Security Policy
```html
<!-- app.html - CSP headers -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data:;">
```

## Error Handling Architecture

### Layered Error Handling
```typescript
// Error boundary pattern for utilities
export const safeExecute = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  context: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error(`Error in ${context}:`, error);
    showToast(`Operation failed: ${context}`, 'error');
    return fallback;
  }
};

// Usage in utilities
export const saveLayout = () => safeExecute(
  () => writeTextFile('layout.json', JSON.stringify($windowsStore)),
  undefined,
  'layout persistence'
);
```

### User Feedback Integration
```typescript
// Error reporting with user feedback
const handleError = (error: Error, context: string) => {
  // Log for debugging
  console.error(`${context}:`, error);

  // User notification
  toastsStore.update(toasts => [...toasts, {
    id: generateId(),
    type: 'error',
    message: `${context} failed: ${error.message}`,
    duration: 5000,
    timestamp: Date.now()
  }]);

  // Recovery action
  attemptRecovery(context, error);
};
```

## Testing Architecture

### Component Testing Strategy
```typescript
// Window.test.ts - Component testing pattern
import { render, fireEvent } from '@testing-library/svelte';
import Window from './Window.svelte';

test('window responds to drag events', async () => {
  const { getByTestId } = render(Window, {
    props: { data: mockWindowData }
  });

  const titleBar = getByTestId('title-bar');
  await fireEvent.pointerDown(titleBar, { clientX: 100, clientY: 50 });
  await fireEvent.pointerMove(window, { clientX: 200, clientY: 100 });

  expect(mockWindowData.x).toBe(100); // Moved 100px right
});
```

### Utility Testing Pattern
```typescript
// snap.test.ts - Utility function testing
import { snapToGrid, detectSnapZone } from './snap.js';

describe('snap functionality', () => {
  test('snaps to left edge correctly', () => {
    const result = snapToGrid(10, 100, 1920, 1080, 50);
    expect(result).toEqual({ x: 0, y: 100 });
  });

  test('detects snap zones accurately', () => {
    const zone = detectSnapZone(25, 300, 1920, 1080, 50);
    expect(zone).toBe('left-half');
  });
});
```

## Build Architecture

### Development vs Production
```typescript
// vite.config.js - Build configuration
export default defineConfig({
  plugins: [sveltekit()],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['svelte', '@tauri-apps/api'],
          utils: ['./src/lib/utils/index.js']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['@tauri-apps/api/fs', '@tauri-apps/api/window']
  }
});
```

### Tauri Build Pipeline
```bash
# Development build
npm run tauri dev

# Production build
npm run tauri build --target universal-apple-darwin

# Bundle analysis
npm run build:analyze
```

## Scalability Considerations

### Component Scalability
- **Lazy Loading**: Dynamic imports for application components
- **Virtual Scrolling**: For lists with many windows
- **Memoization**: Expensive calculations cached per frame
- **Component Pooling**: Reuse window components for performance

### State Scalability
- **Store Segmentation**: Separate stores for different domains
- **Computed Properties**: Derived state for complex calculations
- **Event Sourcing**: Track state changes for debugging
- **Persistence Chunking**: Large layouts split into smaller files

### Performance Monitoring
```typescript
// Performance tracking hooks
export const measureOperation = (name: string) => {
  performance.mark(`${name}-start`);
  return () => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  };
};

// Usage
const stopMeasuring = measureOperation('window-drag');
// ... drag operation
stopMeasuring();
```

---

*This architecture provides a robust foundation for a complex desktop application while maintaining clarity, performance, and extensibility. The layered design allows for independent development and testing of each component while ensuring seamless integration across the entire system.*