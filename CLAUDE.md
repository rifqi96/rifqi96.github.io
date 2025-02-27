# CLAUDE.md - Development Guide

## Build & Development Commands
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run full linting (typecheck, prettier, eslint)
- `yarn typecheck` - Run TypeScript typechecking
- `yarn lint:js` - Run ESLint with auto-fix
- `yarn lint:prettier` - Check formatting without changes
- `yarn lint:prettierWrite` - Auto-format code with Prettier

## Code Style Guidelines
- **Component Names**: Vue components should use PascalCase in imports and kebab-case in templates
- **Formatting**: 2 spaces for indentation (enforced by Prettier)
- **Imports**: Group imports by type (Vue, libraries, internal), sort alphabetically
- **TypeScript**: Use strict typing; prefer interfaces for object types
- **Component Structure**: Use Vue 3 `<script setup>` SFCs with TypeScript
- **Naming**: Use descriptive names; prefer full words over abbreviations
- **Error Handling**: Use try/catch for async operations, ensure proper error states
- **Path Aliases**: Use `@/` for imports from src directory
- **Composables**: Use `use` prefix for composable functions
- **Models/Types**: Define in dedicated files under `models/` and `types/` directories

This project is a Vue 3 application using TypeScript, Vite, ESLint, and Prettier with Vuetify components.