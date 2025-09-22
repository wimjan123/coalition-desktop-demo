# useResize.ts - 8-Direction Window Resizing

## Overview

`useResize.ts` implements comprehensive window resizing functionality with 8-direction resize handles, minimum size constraints, aspect ratio preservation, and smooth visual feedback. It provides professional window resizing behavior comparable to native desktop applications.

## Features

### Core Functionality
- **8-Direction Resizing**: N, S, E, W, NE, NW, SE, SW resize directions
- **Handle Detection**: Automatic resize handle identification and cursor management
- **Size Constraints**: Minimum and maximum size enforcement
- **Aspect Ratio**: Optional aspect ratio preservation during resize
- **Boundary Constraints**: Keep resized windows within desktop bounds

### Advanced Features
- **Visual Feedback**: Dynamic cursor changes and resize indicators
- **Snap-to-Size**: Snap to common window sizes during resize
- **Performance Optimization**: RAF throttling and efficient DOM updates
- **Keyboard Resize**: Alternative keyboard-based resizing
- **Touch Support**: Touch-friendly resize handles for mobile devices

## API Reference

### Main Function
```typescript
interface ResizeOptions {
  // Callbacks
  onResizeStart?: (direction: ResizeDirection, event: PointerEvent) => void;
  onResizeMove?: (bounds: WindowBounds, direction: ResizeDirection) => void;
  onResizeEnd?: (bounds: WindowBounds, direction: ResizeDirection) => void;

  // Constraints
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number | 'preserve';

  // Behavior
  handles?: ResizeDirection[];
  disabled?: boolean;
  snapToSize?: boolean;

  // Visual
  showHandles?: boolean;
  handleSize?: number;
  cursor?: Record<ResizeDirection, string>;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ResizeState {
  isResizing: boolean;
  direction: ResizeDirection | null;
  startBounds: WindowBounds;
  currentBounds: WindowBounds;
  startPointer: { x: number; y: number };
  element: HTMLElement | null;
  pointerId: number | null;
}

const useResize = (element: HTMLElement, options: ResizeOptions = {}) => {
  return {
    start: (event: PointerEvent, direction: ResizeDirection) => void;
    stop: () => void;
    update: (newOptions: Partial<ResizeOptions>) => void;
    destroy: () => void;
    getState: () => ResizeState;
    createHandles: () => HTMLElement[];
  };
};
```

## Implementation Details

### Core Resize Logic
```typescript
export function useResize(element: HTMLElement, options: ResizeOptions = {}) {
  let state: ResizeState = {
    isResizing: false,
    direction: null,
    startBounds: { x: 0, y: 0, width: 0, height: 0 },
    currentBounds: { x: 0, y: 0, width: 0, height: 0 },
    startPointer: { x: 0, y: 0 },
    element: null,
    pointerId: null
  };

  let resizeHandles: HTMLElement[] = [];
  let eventListeners: (() => void)[] = [];
  let animationFrame: number | null = null;

  const defaultOptions: Required<ResizeOptions> = {
    minWidth: 200,
    minHeight: 150,
    maxWidth: Infinity,
    maxHeight: Infinity,
    aspectRatio: undefined,
    handles: ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'],
    disabled: false,
    snapToSize: false,
    showHandles: true,
    handleSize: 8,
    cursor: {
      n: 'ns-resize',
      s: 'ns-resize',
      e: 'ew-resize',
      w: 'ew-resize',
      ne: 'ne-resize',
      nw: 'nw-resize',
      se: 'se-resize',
      sw: 'sw-resize'
    },
    onResizeStart: undefined,
    onResizeMove: undefined,
    onResizeEnd: undefined
  };

  const config = { ...defaultOptions, ...options };

  const startResize = (event: PointerEvent, direction: ResizeDirection) => {
    if (config.disabled) return;

    // Get current element bounds
    const rect = element.getBoundingClientRect();
    const computedStyle = getComputedStyle(element);

    state = {
      isResizing: true,
      direction,
      startBounds: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      },
      currentBounds: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      },
      startPointer: {
        x: event.clientX,
        y: event.clientY
      },
      element,
      pointerId: event.pointerId
    };

    // Capture pointer
    element.setPointerCapture(event.pointerId);

    // Set resize cursor
    document.body.style.cursor = config.cursor[direction];

    // Add global event listeners
    const onMove = throttleResize(handleResizeMove);
    const onEnd = handleResizeEnd;

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onEnd);
    document.addEventListener('pointercancel', onEnd);

    eventListeners.push(
      () => document.removeEventListener('pointermove', onMove),
      () => document.removeEventListener('pointerup', onEnd),
      () => document.removeEventListener('pointercancel', onEnd)
    );

    // Prevent default behaviors
    event.preventDefault();
    event.stopPropagation();

    // Call start callback
    config.onResizeStart?.(direction, event);
  };

  const handleResizeMove = (event: PointerEvent) => {
    if (!state.isResizing || event.pointerId !== state.pointerId) {
      return;
    }

    // Calculate pointer delta
    const deltaX = event.clientX - state.startPointer.x;
    const deltaY = event.clientY - state.startPointer.y;

    // Calculate new bounds based on resize direction
    const newBounds = calculateNewBounds(
      state.startBounds,
      deltaX,
      deltaY,
      state.direction!
    );

    // Apply constraints
    const constrainedBounds = applyResizeConstraints(newBounds, config);

    // Update element
    updateElementBounds(element, constrainedBounds);

    // Update state
    state.currentBounds = constrainedBounds;

    // Call move callback
    config.onResizeMove?.(constrainedBounds, state.direction!);
  };

  const handleResizeEnd = (event: PointerEvent) => {
    if (!state.isResizing || event.pointerId !== state.pointerId) {
      return;
    }

    // Clean up
    element.releasePointerCapture(event.pointerId);
    document.body.style.cursor = '';

    // Remove event listeners
    eventListeners.forEach(cleanup => cleanup());
    eventListeners = [];

    // Cancel animation frame
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    // Call end callback
    config.onResizeEnd?.(state.currentBounds, state.direction!);

    // Reset state
    state.isResizing = false;
    state.direction = null;
    state.pointerId = null;
  };

  // Initialize resize handles
  if (config.showHandles) {
    resizeHandles = createResizeHandles(element, config);
  }

  return {
    start: startResize,
    stop: handleResizeEnd,
    update: (newOptions: Partial<ResizeOptions>) => {
      Object.assign(config, newOptions);
      if (config.showHandles && resizeHandles.length === 0) {
        resizeHandles = createResizeHandles(element, config);
      }
    },
    destroy: () => {
      eventListeners.forEach(cleanup => cleanup());
      resizeHandles.forEach(handle => handle.remove());
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    },
    getState: () => ({ ...state }),
    createHandles: () => createResizeHandles(element, config)
  };
}
```

### Bounds Calculation
```typescript
const calculateNewBounds = (
  startBounds: WindowBounds,
  deltaX: number,
  deltaY: number,
  direction: ResizeDirection
): WindowBounds => {
  let { x, y, width, height } = startBounds;

  switch (direction) {
    case 'n':
      // North: move top edge up, increase height
      y += deltaY;
      height -= deltaY;
      break;

    case 's':
      // South: move bottom edge down, increase height
      height += deltaY;
      break;

    case 'e':
      // East: move right edge right, increase width
      width += deltaX;
      break;

    case 'w':
      // West: move left edge left, increase width
      x += deltaX;
      width -= deltaX;
      break;

    case 'ne':
      // Northeast: north + east
      y += deltaY;
      height -= deltaY;
      width += deltaX;
      break;

    case 'nw':
      // Northwest: north + west
      x += deltaX;
      y += deltaY;
      width -= deltaX;
      height -= deltaY;
      break;

    case 'se':
      // Southeast: south + east
      width += deltaX;
      height += deltaY;
      break;

    case 'sw':
      // Southwest: south + west
      x += deltaX;
      width -= deltaX;
      height += deltaY;
      break;
  }

  return { x, y, width, height };
};
```

### Constraint System
```typescript
const applyResizeConstraints = (
  bounds: WindowBounds,
  config: Required<ResizeOptions>
): WindowBounds => {
  let { x, y, width, height } = bounds;

  // Apply minimum size constraints
  if (width < config.minWidth) {
    const diff = config.minWidth - width;
    width = config.minWidth;

    // Adjust x if resizing from left edge
    if (state.direction?.includes('w')) {
      x -= diff;
    }
  }

  if (height < config.minHeight) {
    const diff = config.minHeight - height;
    height = config.minHeight;

    // Adjust y if resizing from top edge
    if (state.direction?.includes('n')) {
      y -= diff;
    }
  }

  // Apply maximum size constraints
  if (width > config.maxWidth) {
    const diff = width - config.maxWidth;
    width = config.maxWidth;

    if (state.direction?.includes('w')) {
      x += diff;
    }
  }

  if (height > config.maxHeight) {
    const diff = height - config.maxHeight;
    height = config.maxHeight;

    if (state.direction?.includes('n')) {
      y += diff;
    }
  }

  // Apply aspect ratio constraints
  if (config.aspectRatio) {
    const targetAspectRatio = typeof config.aspectRatio === 'number'
      ? config.aspectRatio
      : state.startBounds.width / state.startBounds.height;

    const currentAspectRatio = width / height;

    if (Math.abs(currentAspectRatio - targetAspectRatio) > 0.01) {
      // Adjust based on which dimension changed more
      const widthChange = Math.abs(width - state.startBounds.width);
      const heightChange = Math.abs(height - state.startBounds.height);

      if (widthChange > heightChange) {
        // Width changed more, adjust height
        const newHeight = width / targetAspectRatio;
        const heightDiff = newHeight - height;
        height = newHeight;

        if (state.direction?.includes('n')) {
          y -= heightDiff;
        }
      } else {
        // Height changed more, adjust width
        const newWidth = height * targetAspectRatio;
        const widthDiff = newWidth - width;
        width = newWidth;

        if (state.direction?.includes('w')) {
          x -= widthDiff;
        }
      }
    }
  }

  // Apply snap-to-size
  if (config.snapToSize) {
    const snappedSize = snapToCommonSizes(width, height);
    width = snappedSize.width;
    height = snappedSize.height;
  }

  return { x, y, width, height };
};

const snapToCommonSizes = (width: number, height: number) => {
  const commonSizes = [
    { width: 800, height: 600 },
    { width: 1024, height: 768 },
    { width: 1280, height: 720 },
    { width: 1366, height: 768 },
    { width: 1920, height: 1080 }
  ];

  const snapThreshold = 20;

  for (const size of commonSizes) {
    if (Math.abs(width - size.width) < snapThreshold &&
        Math.abs(height - size.height) < snapThreshold) {
      return size;
    }
  }

  return { width, height };
};
```

### Resize Handles
```typescript
const createResizeHandles = (
  element: HTMLElement,
  config: Required<ResizeOptions>
): HTMLElement[] => {
  const handles: HTMLElement[] = [];

  config.handles.forEach(direction => {
    const handle = document.createElement('div');
    handle.className = `resize-handle resize-handle-${direction}`;
    handle.dataset.resizeDirection = direction;

    // Style the handle
    styleResizeHandle(handle, direction, config.handleSize);

    // Add event listener
    handle.addEventListener('pointerdown', (event) => {
      startResize(event as PointerEvent, direction);
    });

    element.appendChild(handle);
    handles.push(handle);
  });

  return handles;
};

const styleResizeHandle = (
  handle: HTMLElement,
  direction: ResizeDirection,
  size: number
) => {
  const style = handle.style;

  // Base styles
  style.position = 'absolute';
  style.zIndex = '10';
  style.cursor = getCursorForDirection(direction);

  // Position based on direction
  switch (direction) {
    case 'n':
      style.top = `${-size / 2}px`;
      style.left = `${size}px`;
      style.right = `${size}px`;
      style.height = `${size}px`;
      break;

    case 's':
      style.bottom = `${-size / 2}px`;
      style.left = `${size}px`;
      style.right = `${size}px`;
      style.height = `${size}px`;
      break;

    case 'e':
      style.top = `${size}px`;
      style.bottom = `${size}px`;
      style.right = `${-size / 2}px`;
      style.width = `${size}px`;
      break;

    case 'w':
      style.top = `${size}px`;
      style.bottom = `${size}px`;
      style.left = `${-size / 2}px`;
      style.width = `${size}px`;
      break;

    case 'ne':
      style.top = `${-size / 2}px`;
      style.right = `${-size / 2}px`;
      style.width = `${size}px`;
      style.height = `${size}px`;
      break;

    case 'nw':
      style.top = `${-size / 2}px`;
      style.left = `${-size / 2}px`;
      style.width = `${size}px`;
      style.height = `${size}px`;
      break;

    case 'se':
      style.bottom = `${-size / 2}px`;
      style.right = `${-size / 2}px`;
      style.width = `${size}px`;
      style.height = `${size}px`;
      break;

    case 'sw':
      style.bottom = `${-size / 2}px`;
      style.left = `${-size / 2}px`;
      style.width = `${size}px`;
      style.height = `${size}px`;
      break;
  }
};

const getCursorForDirection = (direction: ResizeDirection): string => {
  const cursors = {
    n: 'ns-resize',
    s: 'ns-resize',
    e: 'ew-resize',
    w: 'ew-resize',
    ne: 'ne-resize',
    nw: 'nw-resize',
    se: 'se-resize',
    sw: 'sw-resize'
  };

  return cursors[direction];
};
```

### Performance Optimization
```typescript
// RAF throttling for smooth resizing
const throttleResize = (fn: Function) => {
  let rafId: number | null = null;
  let lastArgs: any[] = [];

  return (...args: any[]) => {
    lastArgs = args;

    if (rafId !== null) return;

    rafId = requestAnimationFrame(() => {
      fn(...lastArgs);
      rafId = null;
    });
  };
};

// Optimized DOM updates
const updateElementBounds = (
  element: HTMLElement,
  bounds: WindowBounds
) => {
  // Batch all style updates
  const style = element.style;

  // Use transform for position (hardware accelerated)
  style.transform = `translate(${bounds.x}px, ${bounds.y}px)`;

  // Use width/height for size
  style.width = `${bounds.width}px`;
  style.height = `${bounds.height}px`;
};

// Debounced constraint checks
const debounceConstraints = (fn: Function, delay = 16) => {
  let timeoutId: number | null = null;

  return (...args: any[]) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
};
```

## Advanced Features

### Keyboard Resizing
```typescript
const handleKeyboardResize = (event: KeyboardEvent) => {
  if (!element || event.target !== element) return;

  const step = event.shiftKey ? 10 : 1;
  const rect = element.getBoundingClientRect();
  let newBounds = {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height
  };

  switch (event.key) {
    case 'ArrowLeft':
      if (event.ctrlKey) {
        newBounds.width -= step;
      }
      break;
    case 'ArrowRight':
      if (event.ctrlKey) {
        newBounds.width += step;
      }
      break;
    case 'ArrowUp':
      if (event.ctrlKey) {
        newBounds.height -= step;
      }
      break;
    case 'ArrowDown':
      if (event.ctrlKey) {
        newBounds.height += step;
      }
      break;
  }

  const constrainedBounds = applyResizeConstraints(newBounds, config);
  updateElementBounds(element, constrainedBounds);
  config.onResizeMove?.(constrainedBounds, 'se'); // Default direction
};
```

### Touch Support
```typescript
const createTouchFriendlyHandles = (
  element: HTMLElement,
  config: Required<ResizeOptions>
) => {
  const touchHandleSize = Math.max(config.handleSize, 20); // Minimum 20px for touch

  return config.handles.map(direction => {
    const handle = document.createElement('div');
    handle.className = `resize-handle touch-handle resize-handle-${direction}`;

    // Larger touch targets
    styleResizeHandle(handle, direction, touchHandleSize);

    // Touch-specific styles
    handle.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    handle.style.borderRadius = '4px';
    handle.style.opacity = '0';
    handle.style.transition = 'opacity 0.2s';

    // Show on hover/touch
    handle.addEventListener('pointerenter', () => {
      handle.style.opacity = '1';
    });

    handle.addEventListener('pointerleave', () => {
      if (!state.isResizing) {
        handle.style.opacity = '0';
      }
    });

    return handle;
  });
};
```

### Resize Guides
```typescript
const showResizeGuides = (bounds: WindowBounds) => {
  const guide = document.createElement('div');
  guide.className = 'resize-guide';
  guide.style.cssText = `
    position: fixed;
    border: 2px dashed #007aff;
    background: rgba(0, 122, 255, 0.1);
    pointer-events: none;
    z-index: 10000;
    left: ${bounds.x}px;
    top: ${bounds.y}px;
    width: ${bounds.width}px;
    height: ${bounds.height}px;
  `;

  document.body.appendChild(guide);

  return guide;
};

const hideResizeGuides = () => {
  document.querySelectorAll('.resize-guide').forEach(guide => {
    guide.remove();
  });
};
```

## Usage Examples

### Basic Window Resizing
```typescript
const windowElement = document.querySelector('.window') as HTMLElement;

const resizeController = useResize(windowElement, {
  minWidth: 300,
  minHeight: 200,
  onResizeStart: (direction) => {
    windowElement.classList.add('resizing');
  },
  onResizeMove: (bounds) => {
    updateWindowStore(windowId, bounds);
  },
  onResizeEnd: (bounds) => {
    windowElement.classList.remove('resizing');
    saveWindowLayout();
  }
});
```

### Aspect Ratio Preservation
```typescript
const imageWindow = useResize(element, {
  aspectRatio: 16/9, // Preserve 16:9 aspect ratio
  minWidth: 320,
  minHeight: 180,
  handles: ['se', 'sw', 'ne', 'nw'], // Only corner handles
  onResizeMove: (bounds) => {
    // Update image container
    updateImageBounds(bounds);
  }
});
```

### Advanced Constraints
```typescript
const constrainedResize = useResize(element, {
  minWidth: 400,
  minHeight: 300,
  maxWidth: 1200,
  maxHeight: 800,
  snapToSize: true,
  onResizeMove: (bounds, direction) => {
    // Apply desktop boundary constraints
    const desktop = getDesktopBounds();
    const constrainedBounds = constrainToDesktop(bounds, desktop);

    if (constrainedBounds !== bounds) {
      updateElementBounds(element, constrainedBounds);
    }
  }
});
```

## Integration with Svelte

### Svelte Action
```typescript
// resize.action.ts
export function resize(node: HTMLElement, options: ResizeOptions = {}) {
  const controller = useResize(node, options);

  return {
    update(newOptions: Partial<ResizeOptions>) {
      controller.update(newOptions);
    },
    destroy() {
      controller.destroy();
    }
  };
}

// Usage in component
<div use:resize={{ minWidth: 300, onResizeMove: handleResize }}>
  <div class="content">Resizable content</div>
</div>
```

### Reactive Resize State
```typescript
import { writable } from 'svelte/store';

const resizeState = writable<ResizeState>({
  isResizing: false,
  direction: null,
  // ... other state
});

const resizeController = useResize(element, {
  onResizeStart: (direction) => {
    resizeState.update(state => ({ ...state, isResizing: true, direction }));
  },
  onResizeMove: (bounds) => {
    resizeState.update(state => ({ ...state, currentBounds: bounds }));
  },
  onResizeEnd: () => {
    resizeState.update(state => ({ ...state, isResizing: false, direction: null }));
  }
});
```

## Testing Support

### Test Utilities
```typescript
export const createMockResizeController = (element: HTMLElement) => {
  let mockState: ResizeState = {
    isResizing: false,
    direction: null,
    startBounds: { x: 0, y: 0, width: 400, height: 300 },
    currentBounds: { x: 0, y: 0, width: 400, height: 300 },
    startPointer: { x: 0, y: 0 },
    element,
    pointerId: null
  };

  return {
    start: (event: Partial<PointerEvent>, direction: ResizeDirection) => {
      mockState.isResizing = true;
      mockState.direction = direction;
      mockState.startPointer = { x: event.clientX || 0, y: event.clientY || 0 };
    },
    resize: (deltaX: number, deltaY: number) => {
      const newBounds = calculateNewBounds(
        mockState.startBounds,
        deltaX,
        deltaY,
        mockState.direction!
      );
      mockState.currentBounds = newBounds;
    },
    end: () => {
      mockState.isResizing = false;
      mockState.direction = null;
    },
    getState: () => ({ ...mockState }),
    destroy: () => {}
  };
};
```

### Component Testing
```typescript
// resize.test.ts
import { useResize } from './useResize.js';

describe('useResize', () => {
  let element: HTMLElement;
  let resizeController: ReturnType<typeof useResize>;

  beforeEach(() => {
    element = document.createElement('div');
    element.style.width = '400px';
    element.style.height = '300px';
    document.body.appendChild(element);
  });

  afterEach(() => {
    resizeController?.destroy();
    document.body.removeChild(element);
  });

  test('applies minimum size constraints', () => {
    const onResizeMove = jest.fn();
    resizeController = useResize(element, {
      minWidth: 500,
      minHeight: 400,
      onResizeMove
    });

    // Start resize
    resizeController.start(
      new PointerEvent('pointerdown', { clientX: 400, clientY: 300, pointerId: 1 }),
      'se'
    );

    // Simulate resize smaller than minimum
    document.dispatchEvent(new PointerEvent('pointermove', {
      clientX: 350, // Would make width 350px
      clientY: 250, // Would make height 250px
      pointerId: 1
    }));

    // Should be constrained to minimum size
    const lastCall = onResizeMove.mock.calls[onResizeMove.mock.calls.length - 1];
    const bounds = lastCall[0];
    expect(bounds.width).toBeGreaterThanOrEqual(500);
    expect(bounds.height).toBeGreaterThanOrEqual(400);
  });

  test('preserves aspect ratio when configured', () => {
    const onResizeMove = jest.fn();
    resizeController = useResize(element, {
      aspectRatio: 4/3,
      onResizeMove
    });

    resizeController.start(
      new PointerEvent('pointerdown', { clientX: 400, clientY: 300, pointerId: 1 }),
      'se'
    );

    document.dispatchEvent(new PointerEvent('pointermove', {
      clientX: 500, // +100px width
      clientY: 350, // +50px height
      pointerId: 1
    }));

    const lastCall = onResizeMove.mock.calls[onResizeMove.mock.calls.length - 1];
    const bounds = lastCall[0];
    const aspectRatio = bounds.width / bounds.height;
    expect(Math.abs(aspectRatio - 4/3)).toBeLessThan(0.01);
  });
});
```

## Related Documentation

### Direct Dependencies
- **[useDrag.ts](./USE_DRAG.md)**: Shared pointer capture patterns
- **[snap.ts](./SNAP.md)**: Size snapping integration

### Component Integration
- **[Window.svelte](../components/WINDOW.md)**: Primary consumer of resize functionality

### Related Features
- **[Window Management](../features/WINDOW_MANAGEMENT.md)**: Overall window management system
- **[Performance](../features/PERFORMANCE_OPTIMIZATION.md)**: Resize performance optimization
- **[Accessibility](../features/ACCESSIBILITY.md)**: Keyboard resizing alternatives

---

*useResize.ts provides professional-grade window resizing functionality that enables users to precisely control window dimensions with comprehensive constraint handling and smooth visual feedback.*