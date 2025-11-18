# Canvas Web Builder

A React + TypeScript web application that provides a canvas-based interface for drawing UI elements that can be converted into a functioning website.

## Tech Stack

- **React 19** with **TypeScript** - Modern UI framework with type safety
- **Vite** - Fast build tool and development server
- **Material-UI (MUI)** - Comprehensive UI component library
- **BiomeJS** - Opinionated linter and formatter (replaces ESLint/Prettier)

## Features (MVP)

- ✅ Interactive canvas for drawing
- ✅ Pen tool with adjustable size and color
- ✅ Menu bar with file/options/help menus
- ✅ Responsive layout with Material-UI

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher) - This project uses pnpm as the package manager

### Installation

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

### Building

Build for production:

```bash
pnpm build
```

### Linting & Formatting

Check code with BiomeJS:

```bash
pnpm lint:biome
```

Format code:

```bash
pnpm format
```

## Project Structure

```
src/
├── components/
│   ├── Canvas.tsx      # Main canvas component with drawing functionality
│   └── MenuBar.tsx     # Menu bar with file/options/help menus
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Architecture

### Canvas Component

The `Canvas` component uses HTML5 Canvas API to provide drawing functionality:
- Mouse event handling for drawing strokes
- Configurable pen color and size
- Smooth line drawing with `lineCap` and `lineJoin`
- Drawing state management (enabled/disabled)

### MenuBar Component

The `MenuBar` provides:
- File menu (New, Open, Save, Save As, Exit)
- Options menu (Preferences, Settings)
- Help menu (About, Documentation)
- Undo/Redo controls
- Delete everything action

### Future Enhancements

This MVP provides the foundation for:
- Additional drawing tools (shapes, text, etc.)
- Layer management
- Export functionality
- Conversion of drawn elements to HTML/CSS/JS
- Component library for common UI elements
- Undo/redo functionality
- Save/load projects

## Development Notes

- BiomeJS is configured with opinionated defaults (tabs, double quotes)
- TypeScript strict mode is enabled
- MUI theme can be customized in `App.tsx`
- Canvas dimensions are configurable via props
