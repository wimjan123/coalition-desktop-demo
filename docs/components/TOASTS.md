# Toasts.svelte - Notification System

## Overview

`Toasts.svelte` implements a comprehensive notification system that displays temporary messages to users. It supports multiple notification types, auto-dismiss functionality, manual dismissal, and queue management with smooth animations.

## Responsibilities

### Core Features
- **Multi-Type Notifications**: Success, error, warning, and info messages
- **Queue Management**: FIFO queue with stacking and overflow handling
- **Auto-Dismiss**: Configurable timeout durations for automatic removal
- **Manual Dismissal**: User-controlled close buttons for persistent messages
- **Animation System**: Smooth enter/exit transitions with spring physics

### Notification Types
1. **Success**: Positive feedback for completed actions
2. **Error**: Error messages and failure notifications
3. **Warning**: Cautionary messages and alerts
4. **Info**: General information and status updates

## Component Structure

```svelte
<!-- Toasts.svelte -->
<script lang="ts">
  import { toastsStore } from '../stores/stores.js';
  import { createEventDispatcher } from 'svelte';
  import { fly, scale } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  // Toast management
  $: toasts = $toastsStore;
  $: visibleToasts = toasts.slice(-5); // Limit visible toasts

  // Auto-dismiss timers
  let dismissTimers = new Map<string, number>();

  // Handle new toasts
  $: {
    toasts.forEach(toast => {
      if (!dismissTimers.has(toast.id) && toast.duration > 0) {
        startDismissTimer(toast);
      }
    });
  }

  // Cleanup timers when toasts are removed
  $: {
    const currentIds = new Set(toasts.map(t => t.id));
    Array.from(dismissTimers.keys()).forEach(id => {
      if (!currentIds.has(id)) {
        clearDismissTimer(id);
      }
    });
  }
</script>

<div class="toasts-container" aria-live="polite" aria-label="Notifications">
  {#each visibleToasts as toast (toast.id)}
    <div
      class="toast toast-{toast.type}"
      class:dismissible={toast.duration > 0}
      in:fly={{ y: 50, duration: 300 }}
      out:scale={{ start: 0.9, duration: 200 }}
      role="alert"
      aria-labelledby="toast-{toast.id}"
    >
      <div class="toast-icon">
        {getToastIcon(toast.type)}
      </div>

      <div class="toast-content">
        <div class="toast-message" id="toast-{toast.id}">
          {toast.message}
        </div>
        {#if toast.title}
          <div class="toast-title">{toast.title}</div>
        {/if}
      </div>

      {#if toast.dismissible !== false}
        <button
          class="toast-close"
          on:click={() => dismissToast(toast.id)}
          aria-label="Close notification"
        >×</button>
      {/if}

      {#if toast.duration > 0}
        <div
          class="toast-progress"
          style="animation-duration: {toast.duration}ms"
        ></div>
      {/if}
    </div>
  {/each}
</div>
```

## Toast Data Structure

### ToastData Interface
```typescript
interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  duration: number; // 0 = persistent, >0 = auto-dismiss in ms
  timestamp: number;
  dismissible?: boolean; // Can be manually closed
  action?: ToastAction; // Optional action button
  metadata?: Record<string, any>; // Additional data
}

interface ToastAction {
  label: string;
  handler: () => void;
  style?: 'primary' | 'secondary';
}
```

### Toast Creation
```typescript
// Toast factory functions
export const createToast = (
  type: ToastType,
  message: string,
  options: Partial<ToastOptions> = {}
): ToastData => {
  const defaults: ToastOptions = {
    duration: getDefaultDuration(type),
    dismissible: true,
    title: undefined,
    action: undefined,
    metadata: {}
  };

  return {
    id: generateId(),
    type,
    message,
    timestamp: Date.now(),
    ...defaults,
    ...options
  };
};

// Convenience functions
export const showSuccess = (message: string, options?: Partial<ToastOptions>) =>
  showToast(createToast('success', message, options));

export const showError = (message: string, options?: Partial<ToastOptions>) =>
  showToast(createToast('error', message, options));

export const showWarning = (message: string, options?: Partial<ToastOptions>) =>
  showToast(createToast('warning', message, options));

export const showInfo = (message: string, options?: Partial<ToastOptions>) =>
  showToast(createToast('info', message, options));
```

## Queue Management

### Toast Queue Implementation
```typescript
// Maximum concurrent toasts
const MAX_VISIBLE_TOASTS = 5;
const MAX_QUEUE_SIZE = 20;

// Add toast to queue
const showToast = (toast: ToastData) => {
  toastsStore.update(toasts => {
    // Remove oldest if over limit
    let updatedToasts = toasts.length >= MAX_QUEUE_SIZE
      ? toasts.slice(1)
      : toasts;

    // Add new toast
    return [...updatedToasts, toast];
  });

  // Start auto-dismiss timer if needed
  if (toast.duration > 0) {
    startDismissTimer(toast);
  }

  // Announce to screen readers
  announceToast(toast);
};

// Remove toast from queue
const dismissToast = (id: string) => {
  toastsStore.update(toasts => toasts.filter(t => t.id !== id));
  clearDismissTimer(id);
};

// Clear all toasts
const clearAllToasts = () => {
  toastsStore.set([]);
  dismissTimers.clear();
};
```

### Auto-Dismiss System
```typescript
// Timer management
const startDismissTimer = (toast: ToastData) => {
  if (toast.duration <= 0) return;

  const timerId = setTimeout(() => {
    dismissToast(toast.id);
  }, toast.duration);

  dismissTimers.set(toast.id, timerId);
};

const clearDismissTimer = (id: string) => {
  const timerId = dismissTimers.get(id);
  if (timerId) {
    clearTimeout(timerId);
    dismissTimers.delete(id);
  }
};

// Pause/resume timers on hover
const pauseTimer = (id: string) => {
  const timerId = dismissTimers.get(id);
  if (timerId) {
    clearTimeout(timerId);
    // Store remaining time for resume
    const toast = toasts.find(t => t.id === id);
    if (toast) {
      const elapsed = Date.now() - toast.timestamp;
      toast.remainingTime = Math.max(0, toast.duration - elapsed);
    }
  }
};

const resumeTimer = (id: string) => {
  const toast = toasts.find(t => t.id === id);
  if (toast && toast.remainingTime > 0) {
    const timerId = setTimeout(() => {
      dismissToast(toast.id);
    }, toast.remainingTime);
    dismissTimers.set(toast.id, timerId);
  }
};
```

## Styling and Animation

### CSS Implementation
```css
.toasts-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast {
  position: relative;
  min-width: 300px;
  max-width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: flex-start;
  padding: 16px;
  pointer-events: auto;
  overflow: hidden;
  transform-origin: top right;
}

/* Toast types */
.toast-success {
  border-left: 4px solid #22c55e;
  background: #f0fdf4;
}

.toast-error {
  border-left: 4px solid #ef4444;
  background: #fef2f2;
}

.toast-warning {
  border-left: 4px solid #f59e0b;
  background: #fffbeb;
}

.toast-info {
  border-left: 4px solid #3b82f6;
  background: #eff6ff;
}

/* Toast elements */
.toast-icon {
  margin-right: 12px;
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  color: #374151;
}

.toast-message {
  font-size: 14px;
  line-height: 1.4;
  color: #6b7280;
  word-wrap: break-word;
}

.toast-close {
  margin-left: 12px;
  background: none;
  border: none;
  font-size: 18px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #374151;
}

/* Progress bar */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: currentColor;
  opacity: 0.3;
  animation: toastProgress linear forwards;
  transform-origin: left;
}

@keyframes toastProgress {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

/* Hover state */
.toast:hover .toast-progress {
  animation-play-state: paused;
}

/* Action button */
.toast-action {
  margin-top: 8px;
}

.toast-action button {
  background: transparent;
  border: 1px solid currentColor;
  color: inherit;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.toast-action button:hover {
  background: currentColor;
  color: white;
}

/* Responsive design */
@media (max-width: 480px) {
  .toasts-container {
    left: 20px;
    right: 20px;
    top: 20px;
  }

  .toast {
    min-width: 0;
    max-width: none;
  }
}
```

### Animation Transitions
```typescript
// Custom transition functions
const toastFly = (node: Element, { y = 50, duration = 300 }) => {
  return {
    duration,
    css: (t: number) => {
      const eased = cubicOut(t);
      return `
        transform: translateY(${(1 - eased) * y}px);
        opacity: ${eased};
      `;
    }
  };
};

const toastScale = (node: Element, { start = 0.9, duration = 200 }) => {
  return {
    duration,
    css: (t: number) => {
      const eased = cubicOut(t);
      return `
        transform: scale(${start + (1 - start) * eased});
        opacity: ${eased};
      `;
    }
  };
};

// Stagger animation for multiple toasts
const calculateDelay = (index: number) => index * 50;
```

## Accessibility Features

### Screen Reader Support
```typescript
// Announce new toasts to screen readers
const announceToast = (toast: ToastData) => {
  const announcement = `${toast.type} notification: ${toast.message}`;

  // Create temporary announcement element
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', 'assertive');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.textContent = announcement;

  document.body.appendChild(announcer);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
};

// Keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Escape':
      // Close focused toast or all toasts
      const focusedToast = document.activeElement?.closest('.toast');
      if (focusedToast) {
        const toastId = focusedToast.getAttribute('data-toast-id');
        if (toastId) dismissToast(toastId);
      } else {
        clearAllToasts();
      }
      break;

    case 'ArrowDown':
    case 'ArrowUp':
      // Navigate between toasts
      navigateToasts(event.key === 'ArrowDown' ? 1 : -1);
      break;
  }
};
```

### ARIA Implementation
```svelte
<div
  class="toasts-container"
  role="region"
  aria-live="polite"
  aria-label="Notifications"
>
  {#each visibleToasts as toast, index (toast.id)}
    <div
      class="toast toast-{toast.type}"
      role="alert"
      aria-labelledby="toast-message-{toast.id}"
      aria-describedby="toast-title-{toast.id}"
      data-toast-id={toast.id}
      tabindex={index === 0 ? 0 : -1}
    >
      <div class="toast-icon" aria-hidden="true">
        {getToastIcon(toast.type)}
      </div>

      <div class="toast-content">
        {#if toast.title}
          <div
            class="toast-title"
            id="toast-title-{toast.id}"
          >{toast.title}</div>
        {/if}
        <div
          class="toast-message"
          id="toast-message-{toast.id}"
        >{toast.message}</div>

        {#if toast.action}
          <div class="toast-action">
            <button
              on:click={toast.action.handler}
              aria-describedby="toast-message-{toast.id}"
            >
              {toast.action.label}
            </button>
          </div>
        {/if}
      </div>

      {#if toast.dismissible !== false}
        <button
          class="toast-close"
          on:click={() => dismissToast(toast.id)}
          aria-label="Close {toast.type} notification"
        >×</button>
      {/if}
    </div>
  {/each}
</div>
```

## Advanced Features

### Toast Actions
```typescript
// Action button implementation
interface ToastAction {
  label: string;
  handler: () => void;
  style?: 'primary' | 'secondary';
  disabled?: boolean;
}

// Example usage
showError('Failed to save document', {
  action: {
    label: 'Retry',
    handler: () => {
      retryOperation();
      dismissToast(toast.id);
    }
  }
});

showInfo('New version available', {
  duration: 0, // Persistent
  action: {
    label: 'Update Now',
    handler: () => startUpdate()
  }
});
```

### Toast Grouping
```typescript
// Group related toasts
interface ToastGroup {
  id: string;
  type: string;
  count: number;
  latestMessage: string;
  timestamp: number;
}

const groupSimilarToasts = (toasts: ToastData[]): ToastData[] => {
  const groups = new Map<string, ToastGroup>();

  toasts.forEach(toast => {
    const groupKey = `${toast.type}-${toast.message}`;
    const existing = groups.get(groupKey);

    if (existing && Date.now() - existing.timestamp < 5000) {
      // Group similar toasts within 5 seconds
      existing.count++;
      existing.timestamp = toast.timestamp;
    } else {
      groups.set(groupKey, {
        id: toast.id,
        type: toast.type,
        count: 1,
        latestMessage: toast.message,
        timestamp: toast.timestamp
      });
    }
  });

  // Convert groups back to toasts
  return Array.from(groups.values()).map(group => ({
    ...createToast(group.type as ToastType, group.latestMessage),
    id: group.id,
    message: group.count > 1
      ? `${group.latestMessage} (${group.count})`
      : group.latestMessage
  }));
};
```

### Persistent Storage
```typescript
// Save important toasts to storage
const saveImportantToasts = (toasts: ToastData[]) => {
  const important = toasts.filter(t =>
    t.type === 'error' || t.duration === 0
  );

  localStorage.setItem('persistentToasts', JSON.stringify(important));
};

// Restore toasts on app start
const restoreImportantToasts = (): ToastData[] => {
  try {
    const stored = localStorage.getItem('persistentToasts');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};
```

## Performance Optimization

### Virtual Scrolling for Large Queues
```typescript
// Virtual scrolling for performance with many toasts
const VISIBLE_TOAST_LIMIT = 5;

$: visibleToasts = toasts.slice(-VISIBLE_TOAST_LIMIT);
$: hiddenCount = Math.max(0, toasts.length - VISIBLE_TOAST_LIMIT);

// Show overflow indicator
{#if hiddenCount > 0}
  <div class="toast-overflow">
    +{hiddenCount} more notifications
    <button on:click={showAllToasts}>Show All</button>
  </div>
{/if}
```

### Memory Management
```typescript
// Cleanup old toasts to prevent memory leaks
const CLEANUP_INTERVAL = 60000; // 1 minute
const MAX_AGE = 300000; // 5 minutes

setInterval(() => {
  const now = Date.now();
  toastsStore.update(toasts =>
    toasts.filter(toast => now - toast.timestamp < MAX_AGE)
  );
}, CLEANUP_INTERVAL);

// Cleanup on component destroy
onDestroy(() => {
  dismissTimers.forEach(clearTimeout);
  dismissTimers.clear();
});
```

## Integration Points

### Global Toast API
```typescript
// Global toast service for use across the application
export class ToastService {
  static show(type: ToastType, message: string, options?: Partial<ToastOptions>) {
    const toast = createToast(type, message, options);
    toastsStore.update(toasts => [...toasts, toast]);
    return toast.id;
  }

  static success(message: string, options?: Partial<ToastOptions>) {
    return this.show('success', message, options);
  }

  static error(message: string, options?: Partial<ToastOptions>) {
    return this.show('error', message, { duration: 0, ...options });
  }

  static warning(message: string, options?: Partial<ToastOptions>) {
    return this.show('warning', message, options);
  }

  static info(message: string, options?: Partial<ToastOptions>) {
    return this.show('info', message, options);
  }

  static dismiss(id: string) {
    toastsStore.update(toasts => toasts.filter(t => t.id !== id));
  }

  static clear() {
    toastsStore.set([]);
  }
}

// Global access
if (typeof window !== 'undefined') {
  (window as any).toast = ToastService;
}
```

### Error Boundary Integration
```typescript
// Automatic error notification
window.addEventListener('error', (event) => {
  ToastService.error(`Unexpected error: ${event.message}`, {
    action: {
      label: 'Report',
      handler: () => reportError(event.error)
    }
  });
});

window.addEventListener('unhandledrejection', (event) => {
  ToastService.error('Operation failed', {
    action: {
      label: 'Details',
      handler: () => console.error(event.reason)
    }
  });
});
```

## Testing Support

### Test Utilities
```typescript
export const toastTestHelpers = {
  getVisibleToasts: () => document.querySelectorAll('.toast'),
  getToastByMessage: (message: string) =>
    Array.from(document.querySelectorAll('.toast-message'))
      .find(el => el.textContent?.includes(message))?.closest('.toast'),
  dismissAll: () => ToastService.clear(),
  waitForToastDismiss: (id: string) => new Promise(resolve => {
    const checkDismissed = () => {
      if (!document.querySelector(`[data-toast-id="${id}"]`)) {
        resolve(true);
      } else {
        setTimeout(checkDismissed, 100);
      }
    };
    checkDismissed();
  })
};
```

### Component Testing
```typescript
// Toasts.test.ts
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import Toasts from './Toasts.svelte';
import { ToastService } from '../utils/toastService.js';

test('displays success toast with auto-dismiss', async () => {
  render(Toasts);

  ToastService.success('Operation completed', { duration: 1000 });

  const toast = await screen.findByText('Operation completed');
  expect(toast).toBeInTheDocument();

  // Wait for auto-dismiss
  await waitFor(() => {
    expect(toast).not.toBeInTheDocument();
  }, { timeout: 1500 });
});

test('dismisses toast when close button is clicked', async () => {
  render(Toasts);

  ToastService.info('Test message');

  const closeButton = await screen.findByLabelText(/close.*notification/i);
  await fireEvent.click(closeButton);

  await waitFor(() => {
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });
});
```

## Related Documentation

### Store Integration
- **[stores.ts](../api/STORES_REFERENCE.md)**: Toast state management
- **[Desktop.svelte](./DESKTOP.md)**: Parent container integration

### Utility Dependencies
- **Animation utilities**: Transition and easing functions
- **ID generation**: Unique identifier creation
- **Storage utilities**: Persistent toast management

### Related Features
- **[Error Handling](../features/ERROR_HANDLING.md)**: Error notification integration
- **[Accessibility](../features/ACCESSIBILITY.md)**: Screen reader and keyboard support
- **[Performance](../features/PERFORMANCE_OPTIMIZATION.md)**: Animation and memory optimization

---

*Toasts.svelte provides a robust and accessible notification system that enhances user experience with timely feedback, comprehensive queue management, and smooth animations while maintaining excellent performance and accessibility standards.*