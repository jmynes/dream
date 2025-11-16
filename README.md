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
- ✅ Toolbar with drawing controls
- ✅ Responsive layout with Material-UI

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building

Build for production:

```bash
npm run build
```

### Linting & Formatting

Check code with BiomeJS:

```bash
npm run lint:biome
```

Format code:

```bash
npm run format
```

## Project Structure

```
src/
├── components/
│   ├── Canvas.tsx      # Main canvas component with drawing functionality
│   └── Toolbar.tsx     # Toolbar with pen controls
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

### Toolbar Component

The `Toolbar` provides:
- Pen tool toggle
- Pen size slider (1-20px)
- Color picker for pen color

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
