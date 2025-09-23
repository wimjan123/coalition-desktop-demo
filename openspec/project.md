# Project Context

## Purpose
Coalition Desktop is a satirical Dutch political simulation game built as a desktop environment interface. Players experience coalition government formation through a window-based desktop metaphor, complete with draggable windows, political party management, campaign systems, and realistic Dutch political data. The project serves as both an educational tool about Dutch politics and a technical showcase of modern web-to-native development.

## Tech Stack
- **Frontend**: Svelte 5 with TypeScript
- **Build Tool**: Vite with SvelteKit
- **Native Platform**: Tauri v2 (Rust backend)
- **State Management**: Svelte stores (reactive state)
- **Styling**: CSS with native Svelte styling
- **Package Manager**: npm with package-lock.json
- **Development**: ESM modules, TypeScript strict mode

## Project Conventions

### Code Style
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **File Naming**: kebab-case for files, PascalCase for Svelte components
- **Directory Structure**: Feature-based organization under `src/lib/`
- **Import Style**: ES modules with explicit `.js` extensions in imports
- **Store Pattern**: Reactive stores for state management with explicit typing
- **Component Style**: Svelte 5 syntax with `<script setup>` pattern where applicable

### Architecture Patterns
- **Window Management**: Component-based window system with drag/resize utilities
- **State Management**: Centralized stores for windows, game state, and UI state
- **Desktop Metaphor**: Complete desktop environment simulation within browser/native window
- **Module Structure**: Clear separation between types, stores, utilities, and components
- **Event Handling**: Pointer events for drag/resize with viewport constraints
- **Performance**: Svelte reactivity with minimal re-renders and optimized interactions

### Testing Strategy
- **Current State**: No formal test framework configured yet
- **Manual Testing**: Web preview via Vite dev server + native testing via Tauri
- **Quality Assurance**: TypeScript compilation checks and Svelte component validation
- **Future**: Unit tests planned for utility modules, integration tests for window management

### Git Workflow
- **Commit Format**: Conventional commits with `feat:`, `fix:`, `refactor:` prefixes
- **Branch Strategy**: Feature branches with descriptive names
- **Main Branch**: `main` for stable releases
- **Development Flow**: Feature branches → main via pull requests
- **Example Commits**:
  - `feat: replace mock data with realistic Dutch political data`
  - `fix: move Maurit de Kat polling interface to taskbar polling app`

## Domain Context
**Dutch Political Simulation Game**
- **Coalition Government**: Core mechanic involves forming and managing Dutch-style coalition governments
- **Political Parties**: Based on real Dutch political parties with realistic data and statistics
- **Campaign System**: Comprehensive political campaign mechanics with regional targeting
- **Population Simulation**: Dynamic population with voting preferences and demographic data
- **News Events**: Realistic political events that affect party standings and coalition dynamics
- **Desktop Metaphor**: Political activities presented through familiar desktop interface paradigms

**Key Political Concepts**:
- **Polder Model**: Dutch consensus-based governance requiring coalition building
- **Regional Campaigns**: Netherlands-specific geographic and demographic targeting
- **Party Statistics**: Realistic polling data, approval ratings, and political positioning

## Important Constraints
- **Platform Target**: Primary deployment as native desktop app via Tauri
- **Cross-Platform**: Must work on macOS, Windows, and Linux via Tauri compilation
- **Performance**: Smooth window dragging/resizing requires optimized pointer handling
- **Security**: Tauri security model with controlled file system access for persistence
- **Educational Accuracy**: Political simulation must maintain educational value about Dutch governance
- **Satirical Balance**: Maintain humor while preserving educational content integrity

## External Dependencies
- **Tauri APIs**: File system access for layout persistence (`fs:read-text-file`, `fs:write-text-file`)
- **Dutch Political Data**: Static data fixtures for parties, demographics, and regions
- **No External APIs**: Fully offline-capable application with embedded data
- **Asset Dependencies**: Static political party logos, icons, and multimedia content
- **Build Dependencies**: Rust toolchain for Tauri compilation, Node.js for frontend build
