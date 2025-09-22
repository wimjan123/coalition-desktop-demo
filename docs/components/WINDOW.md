# Window.svelte - Draggable Window Component

## Overview

`Window.svelte` implements individual draggable, resizable application windows with comprehensive window management features. Each window acts as a container for application content with native-like window controls and behaviors.

## Responsibilities

### Core Window Management
- **Drag Operations**: Smooth window dragging with pointer capture
- **Resize Operations**: 8-direction resizing with visual feedback
- **Focus Management**: Click-to-focus with visual indicators
- **Z-Order Control**: Automatic layering and bring-to-front behavior
- **Window Controls**: Minimize, maximize, close buttons

### Advanced Features
- **Snap-to-Grid**: Edge and grid-based positioning
- **Boundary Constraints**: Keep windows within desktop bounds
- **Visual Feedback**: Resize cursors and drag indicators
- **Accessibility**: Keyboard navigation and screen reader support
- **Performance**: Optimized animations with hardware acceleration

## Component Structure

```svelte
<!-- Window.svelte -->
<script lang="ts">
  import type { WindowData } from '../types/window.js';
  import { useDrag } from '../utils/useDrag.js';
  import { useResize } from '../utils/useResize.js';
  import { snap } from '../utils/snap.js';
  import { bringToFront } from '../utils/zorder.js';

  export let data: WindowData;

  // Window state
  let windowElement: HTMLElement;
  let isDragging = false;
  let isResizing = false;
  let dragOffset = { x: 0, y: 0 };
  let resizeDirection = '';
</script>

<div
  class="window"
  class:focused={data.focused}
  class:minimized={data.minimized}
  class:maximized={data.maximized}
  style="transform: translate({data.x}px, {data.y}px);
         width: {data.width}px;
         height: {data.height}px;
         z-index: {data.zIndex}"
  bind:this={windowElement}
  on:pointerdown={handlePointerDown}
>
  <!-- Window Title Bar -->
  <div class="title-bar" data-drag-handle>
    <div class="title">{data.title}</div>
    <div class="controls">
      <button class="minimize" on:click={minimize}>−</button>
      <button class="maximize" on:click={maximize}>□</button>
      <button class="close" on:click={close}>×</button>
    </div>
  </div>

  <!-- Window Content -->
  <div class="content">
    {#if data.component}
      <svelte:component this={data.component} {...data.props} />
    {:else}
      <div class="placeholder">No content loaded</div>
    {/if}
  </div>

  <!-- Resize Handles -->
  <div class="resize-handle n" data-resize-direction="n"></div>
  <div class="resize-handle s" data-resize-direction="s"></div>
  <div class="resize-handle e" data-resize-direction="e"></div>
  <div class="resize-handle w" data-resize-direction="w"></div>
  <div class="resize-handle ne" data-resize-direction="ne"></div>
  <div class="resize-handle nw" data-resize-direction="nw"></div>
  <div class="resize-handle se" data-resize-direction="se"></div>
  <div class="resize-handle sw" data-resize-direction="sw"></div>
</div>
```

## Props and State

### Component Props
```typescript
interface WindowProps {
  data: WindowData; // Bound window data object
}

interface WindowData {
  id: string;
  title: string;
  component: any; // Svelte component constructor
  props?: Record<string, any>; // Props to pass to component
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  focused: boolean;
  minimized: boolean;
  maximized: boolean;
  resizable?: boolean;
  draggable?: boolean;
  closable?: boolean;
}
```

### Internal State
```typescript
interface WindowState {
  // DOM references
  windowElement: HTMLElement | null;
  titleBarElement: HTMLElement | null;

  // Interaction state
  isDragging: boolean;
  isResizing: boolean;
  dragOffset: { x: number; y: number };
  resizeDirection: string;

  // Previous state for restore operations
  previousState: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  // Performance tracking
  lastUpdateTime: number;
  animationFrameId: number | null;
}
```

## Event Handling

### Pointer Event Management
```typescript
const handlePointerDown = (event: PointerEvent) => {
  // Bring window to front on any interaction
  bringToFront(data.id);

  // Determine interaction type
  const target = event.target as HTMLElement;

  if (isResizeHandle(target)) {
    startResize(event, target.dataset.resizeDirection!);
  } else if (isDragHandle(target)) {
    startDrag(event);
  }

  // Prevent default to avoid text selection
  event.preventDefault();
};

const startDrag = (event: PointerEvent) => {
  if (!data.draggable) return;

  isDragging = true;
  dragOffset = {
    x: event.clientX - data.x,
    y: event.clientY - data.y
  };

  // Capture pointer for smooth dragging
  windowElement.setPointerCapture(event.pointerId);

  // Add global move and up listeners
  document.addEventListener('pointermove', handleDragMove);
  document.addEventListener('pointerup', handleDragEnd);
};

const handleDragMove = (event: PointerEvent) => {
  if (!isDragging) return;

  // Calculate new position
  const newX = event.clientX - dragOffset.x;
  const newY = event.clientY - dragOffset.y;

  // Apply snap-to-grid logic
  const snapped = snap(newX, newY, data.width, data.height);

  // Update window position
  updatePosition(snapped.x, snapped.y);
};

const handleDragEnd = (event: PointerEvent) => {
  if (!isDragging) return;

  isDragging = false;
  windowElement.releasePointerCapture(event.pointerId);

  // Remove global listeners
  document.removeEventListener('pointermove', handleDragMove);
  document.removeEventListener('pointerup', handleDragEnd);

  // Final snap and position update
  finalizePosition();
};
```

### Resize Event Management
```typescript
const startResize = (event: PointerEvent, direction: string) => {
  if (!data.resizable) return;

  isResizing = true;
  resizeDirection = direction;

  // Store initial state
  const initialState = {
    x: data.x,
    y: data.y,
    width: data.width,
    height: data.height,
    mouseX: event.clientX,
    mouseY: event.clientY
  };

  // Capture pointer
  windowElement.setPointerCapture(event.pointerId);

  // Add global listeners with initial state
  const handleResizeMove = (moveEvent: PointerEvent) =>
    handleResizeMoveWithState(moveEvent, initialState);

  document.addEventListener('pointermove', handleResizeMove);
  document.addEventListener('pointerup', () => handleResizeEnd(handleResizeMove));
};

const handleResizeMoveWithState = (
  event: PointerEvent,
  initialState: any
) => {
  if (!isResizing) return;

  const deltaX = event.clientX - initialState.mouseX;
  const deltaY = event.clientY - initialState.mouseY;

  // Calculate new dimensions based on resize direction
  const newBounds = calculateResizeBounds(
    initialState,
    deltaX,
    deltaY,
    resizeDirection
  );

  // Apply minimum size constraints
  const constrainedBounds = applyMinimumConstraints(newBounds);

  // Update window size and position
  updateBounds(constrainedBounds);
};

const calculateResizeBounds = (
  initial: any,
  deltaX: number,
  deltaY: number,
  direction: string
) => {
  let { x, y, width, height } = initial;

  switch (direction) {
    case 'n':
      y += deltaY;
      height -= deltaY;
      break;
    case 's':
      height += deltaY;
      break;
    case 'e':
      width += deltaX;
      break;
    case 'w':
      x += deltaX;
      width -= deltaX;
      break;
    case 'ne':
      y += deltaY;
      height -= deltaY;
      width += deltaX;
      break;
    case 'nw':
      x += deltaX;
      y += deltaY;
      width -= deltaX;
      height -= deltaY;
      break;
    case 'se':
      width += deltaX;
      height += deltaY;
      break;
    case 'sw':
      x += deltaX;
      width -= deltaX;
      height += deltaY;
      break;
  }

  return { x, y, width, height };
};
```

## Window Controls

### Control Button Implementation
```typescript
const minimize = () => {
  if (!data.closable) return;

  data.minimized = !data.minimized;
  updateWindowStore();

  // Animate minimize effect
  if (data.minimized) {
    windowElement.style.transform =
      `translate(${data.x}px, ${data.y}px) scale(0.1)`;
    windowElement.style.opacity = '0';
  } else {
    windowElement.style.transform =
      `translate(${data.x}px, ${data.y}px) scale(1)`;
    windowElement.style.opacity = '1';
  }
};

const maximize = () => {
  if (data.maximized) {
    // Restore to previous size
    data.x = previousState.x;
    data.y = previousState.y;
    data.width = previousState.width;
    data.height = previousState.height;
    data.maximized = false;
  } else {
    // Store current state
    previousState = {
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height
    };

    // Maximize to full desktop
    const desktop = getDesktopBounds();
    data.x = 0;
    data.y = 0;
    data.width = desktop.width;
    data.height = desktop.height - 60; // Account for dock
    data.maximized = true;
  }

  updateWindowStore();
};

const close = () => {
  if (!data.closable) return;

  // Emit close event for parent handling
  dispatch('close', { id: data.id });

  // Animate close effect
  windowElement.style.transform =
    `translate(${data.x}px, ${data.y}px) scale(0)`;
  windowElement.style.opacity = '0';

  // Remove from store after animation
  setTimeout(() => {
    removeFromWindowStore(data.id);
  }, 200);
};
```

## Styling and Animation

### CSS Implementation
```css
.window {
  position: absolute;
  top: 0;
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* Hardware acceleration */
  transform: translateZ(0);
  will-change: transform;

  /* Smooth transitions */
  transition: box-shadow 0.2s, opacity 0.2s;
}

.window.focused {
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
}

.window.minimized {
  pointer-events: none;
}

.window.maximized {
  border-radius: 0;
}

/* Title Bar */
.title-bar {
  height: 32px;
  background: linear-gradient(to bottom, #f8f8f8, #e8e8e8);
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  cursor: grab;
  user-select: none;
}

.title-bar:active {
  cursor: grabbing;
}

.title {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  flex: 1;
  text-align: center;
}

.controls {
  display: flex;
  gap: 6px;
}

.controls button {
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.1s;
}

.close { background: #ff5f57; color: white; }
.minimize { background: #ffbd2e; color: white; }
.maximize { background: #28ca42; color: white; }

.controls button:hover {
  transform: scale(1.1);
}

/* Content Area */
.content {
  flex: 1;
  overflow: auto;
  background: white;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-style: italic;
}

/* Resize Handles */
.resize-handle {
  position: absolute;
  z-index: 10;
}

.resize-handle.n,
.resize-handle.s {
  left: 8px;
  right: 8px;
  height: 4px;
  cursor: ns-resize;
}

.resize-handle.n { top: -2px; }
.resize-handle.s { bottom: -2px; }

.resize-handle.e,
.resize-handle.w {
  top: 8px;
  bottom: 8px;
  width: 4px;
  cursor: ew-resize;
}

.resize-handle.e { right: -2px; }
.resize-handle.w { left: -2px; }

.resize-handle.ne,
.resize-handle.nw,
.resize-handle.se,
.resize-handle.sw {
  width: 8px;
  height: 8px;
}

.resize-handle.ne { top: -4px; right: -4px; cursor: ne-resize; }
.resize-handle.nw { top: -4px; left: -4px; cursor: nw-resize; }
.resize-handle.se { bottom: -4px; right: -4px; cursor: se-resize; }
.resize-handle.sw { bottom: -4px; left: -4px; cursor: sw-resize; }

/* Focus ring for accessibility */
.window:focus-within {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

### Animation System
```typescript
// Smooth position updates with RAF
const updatePosition = (x: number, y: number) => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }

  animationFrameId = requestAnimationFrame(() => {
    data.x = x;
    data.y = y;
    windowElement.style.transform = `translate(${x}px, ${y}px)`;
    animationFrameId = null;
  });
};

// Smooth size updates
const updateBounds = (bounds: WindowBounds) => {
  const { x, y, width, height } = bounds;

  // Batch DOM updates
  windowElement.style.cssText =
    `transform: translate(${x}px, ${y}px); ` +
    `width: ${width}px; ` +
    `height: ${height}px; ` +
    `z-index: ${data.zIndex}`;

  // Update data
  Object.assign(data, bounds);
};
```

## Performance Optimization

### Event Throttling
```typescript
// Throttle drag events for smooth performance
let dragThrottleId: number | null = null;

const throttledDragMove = (event: PointerEvent) => {
  if (dragThrottleId !== null) return;

  dragThrottleId = requestAnimationFrame(() => {
    handleDragMove(event);
    dragThrottleId = null;
  });
};

// Throttle resize events
let resizeThrottleId: number | null = null;

const throttledResizeMove = (event: PointerEvent, initialState: any) => {
  if (resizeThrottleId !== null) return;

  resizeThrottleId = requestAnimationFrame(() => {
    handleResizeMoveWithState(event, initialState);
    resizeThrottleId = null;
  });
};
```

### Memory Management
```typescript
// Cleanup function for component destruction
onDestroy(() => {
  // Cancel any pending animations
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
  if (dragThrottleId !== null) {
    cancelAnimationFrame(dragThrottleId);
  }
  if (resizeThrottleId !== null) {
    cancelAnimationFrame(resizeThrottleId);
  }

  // Remove global event listeners
  document.removeEventListener('pointermove', handleDragMove);
  document.removeEventListener('pointerup', handleDragEnd);
});
```

## Accessibility Features

### Keyboard Navigation
```typescript
const handleKeyDown = (event: KeyboardEvent) => {
  if (!data.focused) return;

  switch (event.key) {
    case 'ArrowLeft':
      if (event.ctrlKey) moveWindow(-10, 0);
      break;
    case 'ArrowRight':
      if (event.ctrlKey) moveWindow(10, 0);
      break;
    case 'ArrowUp':
      if (event.ctrlKey) moveWindow(0, -10);
      break;
    case 'ArrowDown':
      if (event.ctrlKey) moveWindow(0, 10);
      break;
    case 'Escape':
      if (isDragging || isResizing) {
        cancelOperation();
      }
      break;
    case 'w':
      if (event.metaKey || event.ctrlKey) {
        event.preventDefault();
        close();
      }
      break;
  }
};

const moveWindow = (deltaX: number, deltaY: number) => {
  const newX = Math.max(0, data.x + deltaX);
  const newY = Math.max(0, data.y + deltaY);
  updatePosition(newX, newY);
};
```

### ARIA Support
```svelte
<div
  class="window"
  role="dialog"
  aria-labelledby="window-title-{data.id}"
  aria-describedby="window-content-{data.id}"
  tabindex={data.focused ? 0 : -1}
>
  <div
    class="title-bar"
    id="window-title-{data.id}"
    aria-label="Window title bar. Drag to move window."
  >
    <div class="title">{data.title}</div>
    <div class="controls" role="group" aria-label="Window controls">
      <button
        class="minimize"
        aria-label="Minimize window"
        on:click={minimize}
      >−</button>
      <button
        class="maximize"
        aria-label={data.maximized ? 'Restore window' : 'Maximize window'}
        on:click={maximize}
      >{data.maximized ? '⧉' : '□'}</button>
      <button
        class="close"
        aria-label="Close window"
        on:click={close}
      >×</button>
    </div>
  </div>

  <div
    class="content"
    id="window-content-{data.id}"
    role="main"
  >
    <!-- Content -->
  </div>
</div>
```

## Integration Points

### Store Integration
```typescript
import { windowsStore } from '../stores/stores.js';

// Update store when window data changes
$: updateWindowStore(data);

const updateWindowStore = (windowData: WindowData) => {
  windowsStore.update(windows =>
    windows.map(w => w.id === windowData.id ? windowData : w)
  );
};
```

### Utility Integration
```typescript
// Integration with utility modules
import { useDrag } from '../utils/useDrag.js';
import { useResize } from '../utils/useResize.js';
import { snap } from '../utils/snap.js';
import { bringToFront } from '../utils/zorder.js';

// Use utilities in event handlers
const { startDrag, stopDrag } = useDrag({
  onDragMove: (x, y) => updatePosition(x, y),
  onDragEnd: () => finalizePosition()
});

const { startResize, stopResize } = useResize({
  onResizeMove: (bounds) => updateBounds(bounds),
  onResizeEnd: () => finalizeBounds()
});
```

## Testing Support

### Test Utilities
```typescript
// Export test helpers
export const testHelpers = {
  simulateDrag: (startX: number, startY: number, endX: number, endY: number) => {
    // Simulate drag operation for testing
  },
  simulateResize: (direction: string, deltaX: number, deltaY: number) => {
    // Simulate resize operation for testing
  },
  getWindowState: () => ({
    isDragging,
    isResizing,
    data: { ...data }
  })
};
```

### Component Testing
```typescript
// Window.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import Window from './Window.svelte';

test('window responds to drag operations', async () => {
  const windowData = {
    id: 'test-window',
    title: 'Test Window',
    x: 100,
    y: 100,
    width: 400,
    height: 300,
    zIndex: 1,
    focused: true,
    minimized: false,
    maximized: false
  };

  const { getByTestId } = render(Window, { props: { data: windowData } });

  const titleBar = getByTestId('title-bar');

  // Test drag operation
  await fireEvent.pointerDown(titleBar, { clientX: 150, clientY: 120 });
  await fireEvent.pointerMove(document, { clientX: 250, clientY: 220 });
  await fireEvent.pointerUp(document, { clientX: 250, clientY: 220 });

  expect(windowData.x).toBe(200); // Moved 100px right
  expect(windowData.y).toBe(200); // Moved 100px down
});
```

## Related Documentation

### Direct Dependencies
- **[useDrag.ts](../utils/USE_DRAG.md)**: Drag functionality implementation
- **[useResize.ts](../utils/USE_RESIZE.md)**: Resize functionality implementation
- **[snap.ts](../utils/SNAP.md)**: Snap-to-grid positioning
- **[zorder.ts](../utils/ZORDER.md)**: Z-index and focus management

### Store Integration
- **[stores.ts](../api/STORES_REFERENCE.md)**: Window state management
- **[window.ts](../api/TYPES_REFERENCE.md)**: TypeScript interfaces

### Parent Components
- **[Desktop.svelte](./DESKTOP.md)**: Container and orchestrator

### Related Features
- **[Window Management](../features/WINDOW_MANAGEMENT.md)**: Overall window management system
- **[Performance](../features/PERFORMANCE_OPTIMIZATION.md)**: Performance considerations
- **[Accessibility](../features/ACCESSIBILITY.md)**: Accessibility features

---

*Window.svelte provides the core interactive window functionality for coalition-desktop, implementing sophisticated drag, resize, and focus management while maintaining excellent performance and accessibility standards.*