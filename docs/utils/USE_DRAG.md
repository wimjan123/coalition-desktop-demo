# useDrag.ts - Advanced Drag System

## Overview

`useDrag.ts` implements a sophisticated drag system with pointer capture, boundary constraints, snap detection, and performance optimization. It provides smooth dragging functionality for windows and other draggable elements with multi-pointer support and cross-platform compatibility.

## Features

### Core Functionality
- **Pointer Capture**: Advanced pointer capture for smooth dragging across screen boundaries
- **Multi-Pointer Support**: Handle multiple simultaneous touch/pointer inputs
- **Boundary Constraints**: Keep dragged elements within specified bounds
- **Snap Detection**: Integrate with snap-to-grid functionality
- **Performance Optimization**: RAF throttling and GPU acceleration

### Advanced Features
- **Momentum Tracking**: Track drag velocity for momentum-based interactions
- **Constraint Functions**: Custom boundary and movement constraints
- **Event Delegation**: Efficient event handling with cleanup
- **Cross-Platform**: Mouse, touch, and pen input support

## API Reference

### Main Function
```typescript
interface DragOptions {
  // Callbacks
  onDragStart?: (event: PointerEvent, element: HTMLElement) => void;
  onDragMove?: (x: number, y: number, event: PointerEvent) => void;
  onDragEnd?: (x: number, y: number, event: PointerEvent) => void;

  // Constraints
  bounds?: DragBounds | (() => DragBounds);
  constrainToParent?: boolean;
  snapThreshold?: number;

  // Performance
  throttle?: boolean;
  useTransform?: boolean;

  // Behavior
  disabled?: boolean;
  handle?: string | HTMLElement;
  cursor?: string;
}

interface DragBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  velocity: { x: number; y: number };
  element: HTMLElement | null;
  pointerId: number | null;
}

const useDrag = (element: HTMLElement, options: DragOptions = {}) => {
  // Returns drag control object
  return {
    start: (event: PointerEvent) => void;
    stop: () => void;
    update: (newOptions: Partial<DragOptions>) => void;
    destroy: () => void;
    getState: () => DragState;
  };
};
```

## Implementation Details

### Core Drag Logic
```typescript
export function useDrag(element: HTMLElement, options: DragOptions = {}) {
  let state: DragState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    velocity: { x: 0, y: 0 },
    element: null,
    pointerId: null
  };

  let lastMoveTime = 0;
  let animationFrame: number | null = null;
  let eventListeners: (() => void)[] = [];

  const startDrag = (event: PointerEvent) => {
    if (options.disabled) return;

    // Check if drag should start
    if (!shouldStartDrag(event, element, options.handle)) {
      return;
    }

    // Initialize drag state
    state = {
      isDragging: true,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      deltaX: 0,
      deltaY: 0,
      velocity: { x: 0, y: 0 },
      element,
      pointerId: event.pointerId
    };

    // Capture pointer for smooth dragging
    element.setPointerCapture(event.pointerId);

    // Set cursor
    if (options.cursor) {
      document.body.style.cursor = options.cursor;
    }

    // Add global event listeners
    const onMove = throttle(handleDragMove, options.throttle !== false);
    const onEnd = handleDragEnd;

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
    options.onDragStart?.(event, element);
  };

  const handleDragMove = (event: PointerEvent) => {
    if (!state.isDragging || event.pointerId !== state.pointerId) {
      return;
    }

    // Calculate movement
    const newX = event.clientX;
    const newY = event.clientY;
    const deltaX = newX - state.currentX;
    const deltaY = newY - state.currentY;

    // Update velocity tracking
    const now = performance.now();
    const timeDelta = now - lastMoveTime;
    if (timeDelta > 0) {
      state.velocity = {
        x: deltaX / timeDelta,
        y: deltaY / timeDelta
      };
    }
    lastMoveTime = now;

    // Update state
    state.currentX = newX;
    state.currentY = newY;
    state.deltaX = newX - state.startX;
    state.deltaY = newY - state.startY;

    // Apply constraints
    const constrainedPosition = applyConstraints(
      state.deltaX,
      state.deltaY,
      element,
      options
    );

    // Update element position
    updateElementPosition(
      element,
      constrainedPosition.x,
      constrainedPosition.y,
      options.useTransform
    );

    // Call move callback
    options.onDragMove?.(constrainedPosition.x, constrainedPosition.y, event);
  };

  const handleDragEnd = (event: PointerEvent) => {
    if (!state.isDragging || event.pointerId !== state.pointerId) {
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
    options.onDragEnd?.(state.deltaX, state.deltaY, event);

    // Reset state
    state.isDragging = false;
    state.pointerId = null;
  };

  // Initialize
  element.addEventListener('pointerdown', startDrag);
  eventListeners.push(() => element.removeEventListener('pointerdown', startDrag));

  return {
    start: startDrag,
    stop: handleDragEnd,
    update: (newOptions: Partial<DragOptions>) => {
      Object.assign(options, newOptions);
    },
    destroy: () => {
      eventListeners.forEach(cleanup => cleanup());
      eventListeners = [];
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    },
    getState: () => ({ ...state })
  };
}
```

### Constraint System
```typescript
const applyConstraints = (
  deltaX: number,
  deltaY: number,
  element: HTMLElement,
  options: DragOptions
) => {
  let constrainedX = deltaX;
  let constrainedY = deltaY;

  // Get element bounds
  const rect = element.getBoundingClientRect();
  const elementWidth = rect.width;
  const elementHeight = rect.height;

  // Apply boundary constraints
  if (options.bounds) {
    const bounds = typeof options.bounds === 'function'
      ? options.bounds()
      : options.bounds;

    const elementLeft = rect.left + deltaX;
    const elementTop = rect.top + deltaY;
    const elementRight = elementLeft + elementWidth;
    const elementBottom = elementTop + elementHeight;

    // Constrain to bounds
    if (elementLeft < bounds.left) {
      constrainedX = bounds.left - rect.left;
    } else if (elementRight > bounds.right) {
      constrainedX = bounds.right - rect.right;
    }

    if (elementTop < bounds.top) {
      constrainedY = bounds.top - rect.top;
    } else if (elementBottom > bounds.bottom) {
      constrainedY = bounds.bottom - rect.bottom;
    }
  }

  // Constrain to parent
  if (options.constrainToParent && element.parentElement) {
    const parentRect = element.parentElement.getBoundingClientRect();
    const parentBounds = {
      left: parentRect.left,
      top: parentRect.top,
      right: parentRect.right,
      bottom: parentRect.bottom
    };

    const elementLeft = rect.left + constrainedX;
    const elementTop = rect.top + constrainedY;
    const elementRight = elementLeft + elementWidth;
    const elementBottom = elementTop + elementHeight;

    if (elementLeft < parentBounds.left) {
      constrainedX = parentBounds.left - rect.left;
    } else if (elementRight > parentBounds.right) {
      constrainedX = parentBounds.right - rect.right;
    }

    if (elementTop < parentBounds.top) {
      constrainedY = parentBounds.top - rect.top;
    } else if (elementBottom > parentBounds.bottom) {
      constrainedY = parentBounds.bottom - rect.bottom;
    }
  }

  return { x: constrainedX, y: constrainedY };
};
```

### Performance Optimization
```typescript
// RAF throttling for smooth performance
const throttle = (fn: Function, enabled = true) => {
  if (!enabled) return fn;

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

// Optimized position updates
const updateElementPosition = (
  element: HTMLElement,
  x: number,
  y: number,
  useTransform = true
) => {
  if (useTransform) {
    // Use transform for hardware acceleration
    element.style.transform = `translate(${x}px, ${y}px)`;
  } else {
    // Use position for compatibility
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  }
};

// Batch DOM updates
const batchUpdates = (updates: (() => void)[]) => {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
};
```

### Handle Detection
```typescript
const shouldStartDrag = (
  event: PointerEvent,
  element: HTMLElement,
  handle?: string | HTMLElement
): boolean => {
  if (!handle) return true;

  const target = event.target as HTMLElement;

  if (typeof handle === 'string') {
    // CSS selector
    const handleElement = element.querySelector(handle);
    return handleElement?.contains(target) ?? false;
  } else {
    // HTMLElement
    return handle.contains(target);
  }
};

// Handle data attribute
const getDragHandle = (element: HTMLElement): HTMLElement | null => {
  const handleSelector = element.dataset.dragHandle;
  return handleSelector ? element.querySelector(handleSelector) : element;
};
```

## Advanced Features

### Momentum and Inertia
```typescript
interface MomentumOptions {
  enabled: boolean;
  friction: number;
  threshold: number;
}

const applyMomentum = (
  element: HTMLElement,
  velocity: { x: number; y: number },
  options: MomentumOptions
) => {
  if (!options.enabled || Math.abs(velocity.x) + Math.abs(velocity.y) < options.threshold) {
    return;
  }

  let currentVelocity = { ...velocity };
  const friction = options.friction;

  const animate = () => {
    // Apply friction
    currentVelocity.x *= friction;
    currentVelocity.y *= friction;

    // Check if still moving
    if (Math.abs(currentVelocity.x) < 0.1 && Math.abs(currentVelocity.y) < 0.1) {
      return;
    }

    // Update position
    const currentTransform = getComputedStyle(element).transform;
    const matrix = new DOMMatrix(currentTransform);
    const newX = matrix.m41 + currentVelocity.x;
    const newY = matrix.m42 + currentVelocity.y;

    element.style.transform = `translate(${newX}px, ${newY}px)`;

    requestAnimationFrame(animate);
  };

  animate();
};
```

### Snap Integration
```typescript
import { snap, SnapOptions } from './snap.js';

const applySnapToGrid = (
  x: number,
  y: number,
  element: HTMLElement,
  snapOptions: SnapOptions
) => {
  const rect = element.getBoundingClientRect();
  const snapped = snap(
    rect.left + x,
    rect.top + y,
    rect.width,
    rect.height,
    snapOptions
  );

  return {
    x: snapped.x - rect.left,
    y: snapped.y - rect.top
  };
};

// Auto-snap during drag
const handleDragMoveWithSnap = (
  x: number,
  y: number,
  event: PointerEvent,
  element: HTMLElement,
  options: DragOptions
) => {
  if (options.snapThreshold && options.snapThreshold > 0) {
    const snapped = applySnapToGrid(x, y, element, {
      threshold: options.snapThreshold,
      showGuides: true
    });

    return snapped;
  }

  return { x, y };
};
```

### Multi-Touch Support
```typescript
interface MultiTouchState {
  pointers: Map<number, PointerState>;
  center: { x: number; y: number };
  scale: number;
  rotation: number;
}

interface PointerState {
  id: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

const handleMultiTouch = (
  event: PointerEvent,
  state: MultiTouchState
) => {
  const pointer: PointerState = {
    id: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    currentX: event.clientX,
    currentY: event.clientY
  };

  state.pointers.set(event.pointerId, pointer);

  if (state.pointers.size === 2) {
    // Calculate center, scale, rotation for two-finger gestures
    const pointers = Array.from(state.pointers.values());
    const [p1, p2] = pointers;

    state.center = {
      x: (p1.currentX + p2.currentX) / 2,
      y: (p1.currentY + p2.currentY) / 2
    };

    const distance = Math.sqrt(
      Math.pow(p2.currentX - p1.currentX, 2) +
      Math.pow(p2.currentY - p1.currentY, 2)
    );

    const startDistance = Math.sqrt(
      Math.pow(p2.startX - p1.startX, 2) +
      Math.pow(p2.startY - p1.startY, 2)
    );

    state.scale = distance / startDistance;

    state.rotation = Math.atan2(
      p2.currentY - p1.currentY,
      p2.currentX - p1.currentX
    ) - Math.atan2(
      p2.startY - p1.startY,
      p2.startX - p1.startX
    );
  }
};
```

## Usage Examples

### Basic Window Dragging
```typescript
// Simple window drag implementation
const windowElement = document.querySelector('.window') as HTMLElement;

const dragController = useDrag(windowElement, {
  handle: '.title-bar',
  constrainToParent: true,
  onDragStart: (event, element) => {
    element.classList.add('dragging');
    bringToFront(element);
  },
  onDragMove: (x, y) => {
    // Update window position in store
    updateWindowPosition(windowId, x, y);
  },
  onDragEnd: (x, y) => {
    windowElement.classList.remove('dragging');
    saveWindowLayout();
  }
});
```

### Advanced Drag with Constraints
```typescript
const constrainedDrag = useDrag(element, {
  bounds: () => {
    const desktop = document.querySelector('.desktop')!;
    const rect = desktop.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top + 32, // Account for title bar
      right: rect.right,
      bottom: rect.bottom - 60 // Account for dock
    };
  },
  snapThreshold: 20,
  onDragMove: (x, y, event) => {
    // Apply snap-to-grid
    const snapped = applySnapToGrid(x, y, element, {
      threshold: 20,
      showGuides: true
    });

    updateElementPosition(element, snapped.x, snapped.y);
  }
});
```

### Drag with Momentum
```typescript
const momentumDrag = useDrag(element, {
  onDragEnd: (x, y, event) => {
    // Apply momentum based on drag velocity
    const velocity = dragController.getState().velocity;
    applyMomentum(element, velocity, {
      enabled: true,
      friction: 0.95,
      threshold: 0.5
    });
  }
});
```

## Integration with Svelte

### Svelte Action
```typescript
// drag.action.ts - Svelte action wrapper
export function drag(node: HTMLElement, options: DragOptions = {}) {
  const controller = useDrag(node, options);

  return {
    update(newOptions: Partial<DragOptions>) {
      controller.update(newOptions);
    },
    destroy() {
      controller.destroy();
    }
  };
}

// Usage in Svelte component
<div use:drag={{ handle: '.title-bar', onDragMove: handleMove }}>
  <div class="title-bar">Drag me</div>
  <div class="content">Window content</div>
</div>
```

### Reactive Integration
```typescript
// Reactive drag state in Svelte
import { writable } from 'svelte/store';

const dragState = writable<DragState>({
  isDragging: false,
  // ... other state
});

const dragController = useDrag(element, {
  onDragStart: () => {
    dragState.update(state => ({ ...state, isDragging: true }));
  },
  onDragMove: (x, y) => {
    dragState.update(state => ({ ...state, currentX: x, currentY: y }));
  },
  onDragEnd: () => {
    dragState.update(state => ({ ...state, isDragging: false }));
  }
});
```

## Testing Support

### Mock Implementation
```typescript
// Test utilities
export const createMockDragController = (element: HTMLElement) => {
  let mockState: DragState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    velocity: { x: 0, y: 0 },
    element,
    pointerId: null
  };

  return {
    start: (event: Partial<PointerEvent>) => {
      mockState.isDragging = true;
      mockState.startX = event.clientX || 0;
      mockState.startY = event.clientY || 0;
    },
    move: (x: number, y: number) => {
      mockState.currentX = x;
      mockState.currentY = y;
      mockState.deltaX = x - mockState.startX;
      mockState.deltaY = y - mockState.startY;
    },
    end: () => {
      mockState.isDragging = false;
    },
    getState: () => ({ ...mockState }),
    destroy: () => {}
  };
};
```

### Test Examples
```typescript
// drag.test.ts
import { useDrag } from './useDrag.js';

describe('useDrag', () => {
  let element: HTMLElement;
  let dragController: ReturnType<typeof useDrag>;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    dragController?.destroy();
    document.body.removeChild(element);
  });

  test('starts drag on pointer down', () => {
    const onDragStart = jest.fn();
    dragController = useDrag(element, { onDragStart });

    const event = new PointerEvent('pointerdown', {
      clientX: 100,
      clientY: 50,
      pointerId: 1
    });

    element.dispatchEvent(event);

    expect(onDragStart).toHaveBeenCalledWith(event, element);
    expect(dragController.getState().isDragging).toBe(true);
  });

  test('applies boundary constraints', () => {
    const bounds = { left: 0, top: 0, right: 200, bottom: 200 };
    dragController = useDrag(element, { bounds });

    // Simulate drag beyond boundary
    dragController.start(new PointerEvent('pointerdown', {
      clientX: 0,
      clientY: 0,
      pointerId: 1
    }));

    // Mock move event that would go outside bounds
    document.dispatchEvent(new PointerEvent('pointermove', {
      clientX: -50, // Outside left boundary
      clientY: 0,
      pointerId: 1
    }));

    // Element should be constrained to boundary
    const transform = element.style.transform;
    expect(transform).not.toContain('-50px');
  });
});
```

## Related Documentation

### Direct Dependencies
- **[snap.ts](./SNAP.md)**: Snap-to-grid integration
- **[zorder.ts](./ZORDER.md)**: Window focus management during drag

### Component Integration
- **[Window.svelte](../components/WINDOW.md)**: Primary consumer of drag functionality
- **[Desktop.svelte](../components/DESKTOP.md)**: Desktop-level drag coordination

### Related Features
- **[Window Management](../features/WINDOW_MANAGEMENT.md)**: Overall window management system
- **[Performance](../features/PERFORMANCE_OPTIMIZATION.md)**: Drag performance optimization
- **[Accessibility](../features/ACCESSIBILITY.md)**: Keyboard alternatives to dragging

---

*useDrag.ts provides the foundational drag functionality for coalition-desktop, enabling smooth, constrained, and performant dragging operations with advanced features like momentum, multi-touch support, and snap integration.*