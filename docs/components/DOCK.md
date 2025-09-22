# Dock.svelte - Application Launcher

## Overview

`Dock.svelte` implements a macOS-style application launcher dock positioned at the bottom of the desktop. It provides quick access to satirical desktop applications with hover effects, launch animations, and application state indicators.

## Responsibilities

### Core Features
- **Application Launcher**: Quick access to desktop applications
- **Visual Feedback**: Hover effects and launch animations
- **State Indicators**: Show running applications and focus state
- **Application Management**: Launch, focus, and manage application windows
- **Responsive Design**: Adaptive layout for different screen sizes

### Satirical Applications
The dock hosts 7 satirical political applications:
1. **Coalition Builder**: Political coalition formation simulator
2. **Spin Doctor**: Political messaging and PR management
3. **Poll Watcher**: Election monitoring and prediction tools
4. **Lobby Central**: Influence tracking and lobbying management
5. **Crisis Manager**: Political crisis response simulation
6. **Media Circus**: News cycle and media management
7. **Vote Counter**: Election result analysis and visualization

## Component Structure

```svelte
<!-- Dock.svelte -->
<script lang="ts">
  import { windowsStore } from '../stores/stores.js';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  // Application definitions
  const applications = [
    {
      id: 'coalition-builder',
      title: 'Coalition Builder',
      icon: '🤝',
      component: () => import('../applications/CoalitionBuilder.svelte'),
      description: 'Build and manage political coalitions'
    },
    {
      id: 'spin-doctor',
      title: 'Spin Doctor',
      icon: '🎭',
      component: () => import('../applications/SpinDoctor.svelte'),
      description: 'Master the art of political messaging'
    },
    // ... more applications
  ];

  // Application state
  $: runningApps = $windowsStore.map(w => w.appId).filter(Boolean);
  $: focusedApp = $windowsStore.find(w => w.focused)?.appId;
</script>

<div class="dock">
  <div class="dock-container">
    {#each applications as app (app.id)}
      <DockIcon
        {app}
        isRunning={runningApps.includes(app.id)}
        isFocused={focusedApp === app.id}
        on:launch={() => launchApplication(app)}
        on:focus={() => focusApplication(app.id)}
      />
    {/each}
  </div>
</div>
```

## Application Management

### Launch Application
```typescript
const launchApplication = async (app: Application) => {
  try {
    // Check if application is already running
    const existingWindow = $windowsStore.find(w => w.appId === app.id);

    if (existingWindow) {
      // Focus existing window
      focusApplication(app.id);
      return;
    }

    // Load application component dynamically
    const componentModule = await app.component();
    const component = componentModule.default;

    // Create new window for application
    const windowData: WindowData = {
      id: generateId(),
      appId: app.id,
      title: app.title,
      component,
      props: {},
      x: 100 + (runningApps.length * 30), // Cascade windows
      y: 100 + (runningApps.length * 30),
      width: 800,
      height: 600,
      zIndex: getNextZIndex(),
      focused: true,
      minimized: false,
      maximized: false
    };

    // Dispatch launch event to parent
    dispatch('launch', { app, windowData });

    // Show launch animation
    showLaunchAnimation(app.id);

  } catch (error) {
    console.error(`Failed to launch application: ${app.title}`, error);
    showErrorToast(`Could not launch ${app.title}`);
  }
};

const focusApplication = (appId: string) => {
  const appWindows = $windowsStore.filter(w => w.appId === appId);

  if (appWindows.length === 0) return;

  // If multiple windows, focus the most recently used
  const targetWindow = appWindows.reduce((latest, current) =>
    current.lastFocusTime > latest.lastFocusTime ? current : latest
  );

  dispatch('focus', { windowId: targetWindow.id });
};
```

### Application State Management
```typescript
// Track application lifecycle
let applicationStates = new Map<string, ApplicationState>();

interface ApplicationState {
  isRunning: boolean;
  windowCount: number;
  lastLaunched: number;
  totalLaunches: number;
  hasNotifications: boolean;
}

// Update application states reactively
$: updateApplicationStates($windowsStore);

const updateApplicationStates = (windows: WindowData[]) => {
  const newStates = new Map<string, ApplicationState>();

  applications.forEach(app => {
    const appWindows = windows.filter(w => w.appId === app.id);
    const currentState = applicationStates.get(app.id) || {
      isRunning: false,
      windowCount: 0,
      lastLaunched: 0,
      totalLaunches: 0,
      hasNotifications: false
    };

    newStates.set(app.id, {
      ...currentState,
      isRunning: appWindows.length > 0,
      windowCount: appWindows.length
    });
  });

  applicationStates = newStates;
};
```

## Dock Icon Component

### DockIcon Implementation
```svelte
<!-- DockIcon.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let app: Application;
  export let isRunning = false;
  export let isFocused = false;
  export let hasNotifications = false;

  const dispatch = createEventDispatcher();

  // Icon state
  let iconElement: HTMLElement;
  let isHovered = false;
  let isPressed = false;

  // Launch animation
  let bounceAnimation = false;

  const handleClick = () => {
    if (isRunning) {
      dispatch('focus');
    } else {
      dispatch('launch');
      triggerBounceAnimation();
    }
  };

  const triggerBounceAnimation = () => {
    bounceAnimation = true;
    setTimeout(() => bounceAnimation = false, 600);
  };
</script>

<div
  class="dock-icon"
  class:running={isRunning}
  class:focused={isFocused}
  class:hovered={isHovered}
  class:pressed={isPressed}
  class:bounce={bounceAnimation}
  class:notifications={hasNotifications}
  bind:this={iconElement}
  on:click={handleClick}
  on:mouseenter={() => isHovered = true}
  on:mouseleave={() => isHovered = false}
  on:mousedown={() => isPressed = true}
  on:mouseup={() => isPressed = false}
  title={app.description}
  role="button"
  tabindex="0"
  aria-label="Launch {app.title}"
>
  <div class="icon-background">
    <div class="icon-content">
      {app.icon}
    </div>
  </div>

  <!-- Running indicator -->
  {#if isRunning}
    <div class="running-indicator"></div>
  {/if}

  <!-- Notification badge -->
  {#if hasNotifications}
    <div class="notification-badge"></div>
  {/if}

  <!-- Tooltip -->
  {#if isHovered}
    <div class="tooltip">{app.title}</div>
  {/if}
</div>
```

## Styling and Animation

### Dock Styling
```css
.dock {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  pointer-events: none;
}

.dock-container {
  display: flex;
  justify-content: center;
  align-items: end;
  padding: 8px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 16px 16px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  transition: all 0.3s ease;
}

.dock-container:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-4px);
}

/* Icon styling */
.dock-icon {
  position: relative;
  width: 64px;
  height: 64px;
  margin: 0 4px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: bottom center;
}

.dock-icon:hover {
  transform: scale(1.2) translateY(-8px);
}

.dock-icon:active,
.dock-icon.pressed {
  transform: scale(1.1) translateY(-4px);
}

.dock-icon.focused {
  transform: scale(1.15) translateY(-6px);
}

.icon-background {
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #f0f0f0, #d0d0d0);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 2px rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;
}

.dock-icon:hover .icon-background {
  box-shadow:
    0 8px 16px rgba(0, 0, 0, 0.15),
    inset 0 1px 2px rgba(255, 255, 255, 0.7);
}

.icon-content {
  font-size: 32px;
  transition: all 0.2s ease;
}

.dock-icon:hover .icon-content {
  font-size: 36px;
}

/* Running indicator */
.running-indicator {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  background: #007aff;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(0, 122, 255, 0.5);
}

.dock-icon.focused .running-indicator {
  background: #ff6b35;
  box-shadow: 0 0 4px rgba(255, 107, 53, 0.5);
}

/* Notification badge */
.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background: #ff3b30;
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Bounce animation */
.dock-icon.bounce {
  animation: bounce 0.6s ease-out;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: scale(1) translateY(0);
  }
  40%, 43% {
    transform: scale(1.1) translateY(-12px);
  }
  70% {
    transform: scale(1.05) translateY(-6px);
  }
  90% {
    transform: scale(1.02) translateY(-2px);
  }
}

/* Tooltip */
.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 12px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  animation: tooltipFadeIn 0.2s ease-out forwards;
}

@keyframes tooltipFadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(4px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* Responsive design */
@media (max-width: 768px) {
  .dock-icon {
    width: 48px;
    height: 48px;
    margin: 0 2px;
  }

  .icon-content {
    font-size: 24px;
  }

  .dock-icon:hover .icon-content {
    font-size: 26px;
  }
}
```

## Keyboard Navigation

### Accessibility Implementation
```typescript
const handleKeyDown = (event: KeyboardEvent, appIndex: number) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      launchApplication(applications[appIndex]);
      break;

    case 'ArrowLeft':
      event.preventDefault();
      focusPreviousIcon(appIndex);
      break;

    case 'ArrowRight':
      event.preventDefault();
      focusNextIcon(appIndex);
      break;

    case 'Home':
      event.preventDefault();
      focusFirstIcon();
      break;

    case 'End':
      event.preventDefault();
      focusLastIcon();
      break;

    case 'Escape':
      event.preventDefault();
      blurAllIcons();
      break;
  }
};

const focusPreviousIcon = (currentIndex: number) => {
  const previousIndex = currentIndex > 0 ? currentIndex - 1 : applications.length - 1;
  focusIconByIndex(previousIndex);
};

const focusNextIcon = (currentIndex: number) => {
  const nextIndex = currentIndex < applications.length - 1 ? currentIndex + 1 : 0;
  focusIconByIndex(nextIndex);
};

const focusIconByIndex = (index: number) => {
  const iconElement = document.querySelector(`[data-app-index="${index}"]`) as HTMLElement;
  iconElement?.focus();
};
```

### ARIA Support
```svelte
<div
  class="dock"
  role="toolbar"
  aria-label="Application dock"
  aria-orientation="horizontal"
>
  <div class="dock-container">
    {#each applications as app, index (app.id)}
      <div
        class="dock-icon"
        role="button"
        tabindex="0"
        data-app-index={index}
        aria-label="Launch {app.title}: {app.description}"
        aria-pressed={isRunning}
        aria-describedby="dock-instructions"
        on:click={() => launchApplication(app)}
        on:keydown={(e) => handleKeyDown(e, index)}
      >
        <!-- Icon content -->
      </div>
    {/each}
  </div>

  <!-- Screen reader instructions -->
  <div id="dock-instructions" class="sr-only">
    Press Enter or Space to launch application.
    Use arrow keys to navigate between applications.
  </div>
</div>
```

## Performance Optimization

### Lazy Loading
```typescript
// Lazy load application components
const loadApplicationComponent = async (app: Application) => {
  if (componentCache.has(app.id)) {
    return componentCache.get(app.id);
  }

  try {
    const module = await app.component();
    const component = module.default;
    componentCache.set(app.id, component);
    return component;
  } catch (error) {
    console.error(`Failed to load component for ${app.title}:`, error);
    return null;
  }
};

// Component cache
const componentCache = new Map<string, any>();
```

### Animation Optimization
```typescript
// Use RAF for smooth animations
let animationFrame: number | null = null;

const triggerHoverAnimation = (element: HTMLElement) => {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
  }

  animationFrame = requestAnimationFrame(() => {
    element.style.transform = 'scale(1.2) translateY(-8px)';
    animationFrame = null;
  });
};

// Cleanup on component destroy
onDestroy(() => {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
  }
});
```

## Context Menu Support

### Right-Click Functionality
```typescript
const handleContextMenu = (event: MouseEvent, app: Application) => {
  event.preventDefault();

  const appWindows = $windowsStore.filter(w => w.appId === app.id);
  const menuItems = [];

  if (appWindows.length === 0) {
    menuItems.push({
      label: `Launch ${app.title}`,
      action: () => launchApplication(app)
    });
  } else {
    menuItems.push(
      {
        label: `New ${app.title} Window`,
        action: () => launchApplication(app)
      },
      { separator: true }
    );

    appWindows.forEach((window, index) => {
      menuItems.push({
        label: `${window.title}${window.focused ? ' (focused)' : ''}`,
        action: () => focusWindow(window.id)
      });
    });

    menuItems.push(
      { separator: true },
      {
        label: `Close All ${app.title} Windows`,
        action: () => closeAllAppWindows(app.id)
      }
    );
  }

  showContextMenu(event.clientX, event.clientY, menuItems);
};
```

## Integration Points

### Parent Communication
```typescript
// Event dispatching to parent components
const dispatch = createEventDispatcher<{
  launch: { app: Application; windowData: WindowData };
  focus: { windowId: string };
  close: { appId: string };
}>();

// Usage in event handlers
const launchApplication = async (app: Application) => {
  const windowData = await createWindowForApp(app);
  dispatch('launch', { app, windowData });
};

const focusApplication = (windowId: string) => {
  dispatch('focus', { windowId });
};
```

### Store Integration
```typescript
// Reactive store subscriptions
$: runningApplications = $windowsStore.reduce((apps, window) => {
  if (window.appId && !apps.includes(window.appId)) {
    apps.push(window.appId);
  }
  return apps;
}, [] as string[]);

$: focusedApplication = $windowsStore.find(w => w.focused)?.appId;

// Update application states
$: applications.forEach(app => {
  const appWindows = $windowsStore.filter(w => w.appId === app.id);
  app.isRunning = appWindows.length > 0;
  app.windowCount = appWindows.length;
  app.isFocused = appWindows.some(w => w.focused);
});
```

## Testing Support

### Test Utilities
```typescript
export const dockTestHelpers = {
  getApplications: () => applications,
  simulateIconClick: (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (app) launchApplication(app);
  },
  getRunningApps: () => runningApplications,
  getFocusedApp: () => focusedApplication
};
```

### Component Testing
```typescript
// Dock.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import Dock from './Dock.svelte';

test('launches application when icon is clicked', async () => {
  const { getByLabelText } = render(Dock);

  const coalitionIcon = getByLabelText(/Launch Coalition Builder/i);
  await fireEvent.click(coalitionIcon);

  // Verify launch event was dispatched
  expect(mockDispatch).toHaveBeenCalledWith('launch',
    expect.objectContaining({
      app: expect.objectContaining({ id: 'coalition-builder' })
    })
  );
});

test('focuses existing window when running app is clicked', async () => {
  const { getByLabelText } = render(Dock, {
    props: { runningApps: ['coalition-builder'] }
  });

  const coalitionIcon = getByLabelText(/Launch Coalition Builder/i);
  await fireEvent.click(coalitionIcon);

  // Verify focus event was dispatched instead of launch
  expect(mockDispatch).toHaveBeenCalledWith('focus',
    expect.objectContaining({ windowId: expect.any(String) })
  );
});
```

## Related Documentation

### Component Dependencies
- **[Desktop.svelte](./DESKTOP.md)**: Parent container component
- **[stores.ts](../api/STORES_REFERENCE.md)**: Window state management

### Application Integration
- **Application Components**: Individual satirical application implementations
- **[Window Management](../features/WINDOW_MANAGEMENT.md)**: Window lifecycle integration

### Utility Dependencies
- **[zorder.ts](../utils/ZORDER.md)**: Window focus management
- **Context Menu Utility**: Right-click menu functionality

### Related Features
- **[Keyboard Shortcuts](../features/KEYBOARD_SHORTCUTS.md)**: Dock keyboard navigation
- **[Performance](../features/PERFORMANCE_OPTIMIZATION.md)**: Animation and loading optimization
- **[Accessibility](../features/ACCESSIBILITY.md)**: Screen reader and keyboard support

---

*Dock.svelte provides an intuitive and visually appealing application launcher that serves as the primary entry point for accessing satirical desktop applications, with comprehensive state management and accessibility features.*