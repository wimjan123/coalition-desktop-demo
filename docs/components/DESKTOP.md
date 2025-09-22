# Desktop.svelte - Main Desktop Container

## Overview

`Desktop.svelte` serves as the main container and orchestrator for the entire desktop environment. It manages the overall layout, coordinates child components, and handles desktop-level events and state management.

## Responsibilities

### Primary Functions
- **Container Management**: Provides the main desktop workspace area
- **Component Orchestration**: Coordinates Window, Dock, and Toast components
- **Global Event Handling**: Manages desktop-level mouse and keyboard events
- **Layout Management**: Controls overall desktop layout and positioning
- **State Coordination**: Connects component state with global stores

### Secondary Functions
- **Background Management**: Desktop wallpaper and visual styling
- **Context Menu**: Right-click desktop menu functionality
- **Drag/Drop Coordination**: Desktop-level drag and drop operations
- **Accessibility**: Desktop-wide keyboard navigation and screen reader support

## Component Structure

```svelte
<!-- Desktop.svelte -->
<script lang="ts">
  import { windowsStore, toastsStore, desktopStore } from '../stores/stores.js';
  import Window from './Window.svelte';
  import Dock from './Dock.svelte';
  import Toasts from './Toasts.svelte';

  // Desktop state management
  let desktopElement: HTMLElement;
  let isDragging = false;
  let isResizing = false;
</script>

<main class="desktop" bind:this={desktopElement}>
  <!-- Dynamic window rendering -->
  {#each $windowsStore as window (window.id)}
    <Window bind:data={window} />
  {/each}

  <!-- Fixed dock position -->
  <Dock />

  <!-- Notification system -->
  <Toasts />
</main>
```

## Props and State

### Component Props
```typescript
// No external props - Desktop is the root component
```

### Internal State
```typescript
interface DesktopState {
  // DOM references
  desktopElement: HTMLElement | null;

  // Global interaction state
  isDragging: boolean;
  isResizing: boolean;
  activeOperation: 'none' | 'drag' | 'resize' | 'select';

  // Desktop properties
  width: number;
  height: number;
  scale: number;

  // Accessibility
  focusedElementId: string | null;
  announcements: string[];
}
```

### Store Subscriptions
```typescript
// Reactive store bindings
$: windows = $windowsStore;
$: toasts = $toastsStore;
$: desktopConfig = $desktopStore;

// Computed properties
$: totalWindows = windows.length;
$: focusedWindow = windows.find(w => w.focused);
$: hasActiveOperation = isDragging || isResizing;
```

## Event Handling

### Global Event Listeners
```typescript
// Desktop-level event coordination
const handleGlobalPointerMove = (event: PointerEvent) => {
  if (isDragging) {
    // Coordinate with active drag operation
    updateDragOperation(event);
  } else if (isResizing) {
    // Coordinate with active resize operation
    updateResizeOperation(event);
  }
};

const handleGlobalPointerUp = (event: PointerEvent) => {
  // End any active operations
  endDragOperation();
  endResizeOperation();

  // Update global state
  isDragging = false;
  isResizing = false;
};

const handleKeyboard = (event: KeyboardEvent) => {
  // Global keyboard shortcuts
  if (event.metaKey || event.ctrlKey) {
    switch (event.key) {
      case 'w':
        closeActiveWindow();
        break;
      case '`':
        cycleWindows();
        break;
    }
  }

  if (event.key === 'Escape') {
    cancelActiveOperation();
  }
};
```

### Desktop Context Menu
```typescript
const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault();

  const contextMenu = [
    { label: 'New Window', action: () => createWindow('Untitled', null) },
    { label: 'Refresh Desktop', action: () => refreshDesktop() },
    { separator: true },
    { label: 'Desktop Settings', action: () => openSettings() }
  ];

  showContextMenu(event.clientX, event.clientY, contextMenu);
};
```

## Child Component Integration

### Window Management
```typescript
// Window lifecycle management
const createWindow = (title: string, component: any, props = {}) => {
  const newWindow: WindowData = {
    id: generateId(),
    title,
    component,
    props,
    x: 100 + (windows.length * 30), // Cascade positioning
    y: 100 + (windows.length * 30),
    width: 800,
    height: 600,
    zIndex: getNextZIndex(),
    focused: true,
    minimized: false,
    maximized: false
  };

  windowsStore.update(windows => {
    // Unfocus other windows
    const updated = windows.map(w => ({ ...w, focused: false }));
    return [...updated, newWindow];
  });
};

const closeWindow = (id: string) => {
  windowsStore.update(windows => windows.filter(w => w.id !== id));
};

const focusWindow = (id: string) => {
  windowsStore.update(windows =>
    windows.map(w => ({ ...w, focused: w.id === id }))
  );
};
```

### Dock Integration
```typescript
// Handle dock application launches
const handleDockLaunch = (appId: string) => {
  const app = getApplicationById(appId);
  if (app) {
    createWindow(app.title, app.component, app.defaultProps);
  }
};

// Pass dock event handlers
$: dockProps = {
  onLaunchApp: handleDockLaunch,
  windows: $windowsStore,
  activeWindow: focusedWindow
};
```

### Toast Management
```typescript
// Global toast notification system
const showToast = (message: string, type: ToastType, duration = 3000) => {
  const toast: ToastData = {
    id: generateId(),
    type,
    message,
    duration,
    timestamp: Date.now()
  };

  toastsStore.update(toasts => [...toasts, toast]);

  // Auto-dismiss timer
  setTimeout(() => {
    dismissToast(toast.id);
  }, duration);
};

const dismissToast = (id: string) => {
  toastsStore.update(toasts => toasts.filter(t => t.id !== id));
};
```

## Layout and Styling

### CSS Architecture
```css
.desktop {
  /* Full viewport coverage */
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  /* Desktop background */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: cover;
  background-attachment: fixed;

  /* Prevent text selection during drag operations */
  user-select: none;

  /* Hardware acceleration */
  transform: translateZ(0);

  /* Overflow handling */
  overflow: hidden;
}

.desktop.dragging {
  cursor: grabbing;
}

.desktop.resizing {
  cursor: nw-resize; /* Dynamic based on resize direction */
}

/* Desktop grid overlay (optional) */
.desktop::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}

.desktop.show-grid::before {
  opacity: 1;
}
```

### Responsive Design
```css
/* Tablet adaptation */
@media (max-width: 1024px) {
  .desktop {
    /* Adjust for touch interfaces */
    touch-action: none;
  }
}

/* Mobile adaptation (if supported) */
@media (max-width: 768px) {
  .desktop {
    /* Stack windows vertically */
    flex-direction: column;
  }
}
```

## Performance Optimization

### Component Optimization
```typescript
// Lazy loading for heavy components
const loadComponent = async (componentName: string) => {
  try {
    const module = await import(`../applications/${componentName}.svelte`);
    return module.default;
  } catch (error) {
    console.error(`Failed to load component: ${componentName}`, error);
    return null;
  }
};

// Memoized calculations
$: desktopBounds = memoize(() => {
  if (!desktopElement) return { width: 0, height: 0 };
  return {
    width: desktopElement.clientWidth,
    height: desktopElement.clientHeight
  };
}, [desktopElement?.clientWidth, desktopElement?.clientHeight]);
```

### Event Optimization
```typescript
// Throttled global event handlers
let globalEventThrottle: number | null = null;

const throttledGlobalMove = (event: PointerEvent) => {
  if (globalEventThrottle !== null) return;

  globalEventThrottle = requestAnimationFrame(() => {
    handleGlobalPointerMove(event);
    globalEventThrottle = null;
  });
};

// Cleanup on component destroy
onDestroy(() => {
  if (globalEventThrottle !== null) {
    cancelAnimationFrame(globalEventThrottle);
  }
});
```

## Accessibility Features

### Keyboard Navigation
```typescript
// Desktop-wide keyboard navigation
const handleKeyboardNavigation = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Tab':
      if (event.shiftKey) {
        focusPreviousElement();
      } else {
        focusNextElement();
      }
      break;

    case 'ArrowLeft':
    case 'ArrowRight':
    case 'ArrowUp':
    case 'ArrowDown':
      if (event.ctrlKey) {
        moveActiveWindow(event.key);
      }
      break;

    case 'Enter':
    case ' ':
      activateFocusedElement();
      break;
  }
};
```

### Screen Reader Support
```typescript
// ARIA live region for announcements
let announcements: string[] = [];

const announce = (message: string) => {
  announcements = [...announcements, message];

  // Clear announcement after screen reader processes it
  setTimeout(() => {
    announcements = announcements.filter(a => a !== message);
  }, 1000);
};

// Usage examples
$: if (focusedWindow) {
  announce(`Window ${focusedWindow.title} is now focused`);
}

$: if (windows.length !== previousWindowCount) {
  announce(`${windows.length} windows open`);
}
```

## Integration Points

### Store Integration
```typescript
// Desktop store updates
$: desktopStore.set({
  isDragging,
  isResizing,
  activeOperation: getActiveOperation(),
  bounds: desktopBounds,
  focusedWindowId: focusedWindow?.id || null
});
```

### Component Communication
```typescript
// Event bus for component communication
import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

// Window events
const handleWindowEvent = (event: CustomEvent) => {
  switch (event.type) {
    case 'window-focus':
      focusWindow(event.detail.id);
      break;
    case 'window-close':
      closeWindow(event.detail.id);
      break;
    case 'window-minimize':
      minimizeWindow(event.detail.id);
      break;
  }
};
```

## Testing Support

### Test Data Access
```typescript
// Expose internal state for testing
export const getDesktopState = () => ({
  windows: $windowsStore,
  toasts: $toastsStore,
  desktop: $desktopStore,
  isDragging,
  isResizing
});

// Test helper functions
export const testHelpers = {
  createTestWindow: (props = {}) => createWindow('Test Window', null, props),
  clearAllWindows: () => windowsStore.set([]),
  simulateKeyboard: (key: string, modifiers = {}) => handleKeyboard(new KeyboardEvent('keydown', { key, ...modifiers }))
};
```

### Component Testing
```typescript
// Desktop.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import Desktop from './Desktop.svelte';

test('creates new window when dock app is launched', async () => {
  const { component } = render(Desktop);

  // Simulate dock app launch
  component.$set({ /* test props */ });

  // Verify window creation
  const state = component.getDesktopState();
  expect(state.windows).toHaveLength(1);
});
```

## Related Components

### Direct Children
- **[Window.svelte](./WINDOW.md)**: Individual draggable windows
- **[Dock.svelte](./DOCK.md)**: Application launcher
- **[Toasts.svelte](./TOASTS.md)**: Notification system

### Utilities Used
- **[stores.ts](../api/STORES_REFERENCE.md)**: State management
- **[useKeyboard.ts](../utils/USE_KEYBOARD.md)**: Global keyboard handling
- **[zorder.ts](../utils/ZORDER.md)**: Window layering management

### Related Documentation
- **[Architecture](../ARCHITECTURE.md)**: Overall system architecture
- **[Performance](../features/PERFORMANCE_OPTIMIZATION.md)**: Performance considerations
- **[Accessibility](../features/ACCESSIBILITY.md)**: Accessibility implementation

---

*Desktop.svelte serves as the foundation of the coalition-desktop application, providing a robust and performant container for all desktop functionality while maintaining clean separation of concerns and excellent user experience.*