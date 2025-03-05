# Rifqi's Portfolio and Utilities Website

A modern, responsive personal website and portfolio built with Vue 3, Nuxt 3, and Vuetify, featuring a blog, project showcase, and interactive utilities like a Margin Calculator.

## Flow diagrams

![Data access flow](./docs/flow_diagrams/data-access-flow.mermaid)
![Authentication flow](./docs/flow_diagrams/authentication-flow.mermaid)

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Core Technologies](#core-technologies)
- [Key Features](#key-features)
- [Domain Organization](#domain-organization)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Design Patterns](#design-patterns)

## Architecture Overview

This project is built using a modern frontend stack with Nuxt 3 as the foundation. It follows a domain-driven architecture that separates concerns by feature domain, making the codebase more maintainable and extensible.

### Architecture Highlights

- **Framework**: Nuxt 3 (Vue 3) with full TypeScript support
- **UI Framework**: Vuetify 3 for component styling
- **State Management**: Vue 3 Composition API with reactive state
- **Routing**: Built-in Nuxt file-based routing
- **Content Management**: Nuxt Content module for blog articles
- **Build Tool**: Vite for fast development and optimized builds
- **SEO**: Built-in meta-tag management and content visibility
- **Analytics**: Vercel Analytics for performance and usage tracking

## Project Structure

```sh
rifqi96.github.io/
├── app 
├── assets/              # Static assets like CSS
├── composables/         # Shared reusable logic hooks
├── content/             # CMS content (blog posts, metadata)
├── domains/             # Feature domains (home, margin-calculator, etc.)
│   ├── home/            # Home page specific components and logic
│   └── margin-calculator/  # Margin calculator utility components and logic
│   └── auth             # Authentication domain components and logic
│   └── console          # Console domain components and logic
├── layouts/             # Page layouts
├── pages/
│   ├── auth/            # Pages for auth.rifqi.dev
│   ├── console/         # Pages for console.rifqi.dev
│   └── _main/           # Pages for the main domain rifqi.dev
├── plugins/             # Nuxt plugins
├── public/              # Public static files
│   ├── data/            # CSV data files for projects and experience
│   └── projects/        # Project images
├── router/              # Nuxt router configuration
│   ├── _main            # Main domain router
│   └── auth             # Auth domain router
│   └── console          # Console domain router
├── server/
│   └── middleware/      # Middleware for server-side logic 
└── utils/               # Utility functions
```

## Core Technologies

- **Vue 3**: Progressive JavaScript framework using the Composition API
- **Nuxt 3**: Meta framework for creating Vue applications with server-side rendering (SSR)
- **TypeScript**: For type-safe code and better developer experience
- **Vuetify 3**: Material Design component library for Vue
- **Nuxt Content**: Headless CMS for content management and Markdown rendering
- **Vite**: Next generation frontend tooling for development and building
- **Vercel Analytics**: Built-in analytics for web performance monitoring

## Key Features

### Personal Portfolio

- Responsive design with mobile-first approach
- Interactive sections showcasing skills, experience, and projects
- Animations and transitions for enhanced user experience
- CSV-driven content for easy updates to projects and work experience

### Blog System

- Markdown-based content management
- Tagging and categorization
- Code syntax highlighting
- SEO optimization for content visibility

### Margin Calculator

- Interactive trading utility for calculating margin positions
- Integration with Binance API for real-time pricing
- Trade history storage and management
- Command generation for trading platforms

## Domain Organization

The project follows a domain-driven approach, organizing code by feature domains:

### Home Domain

Contains components and logic specific to the landing page, including:

- Hero section with parallax effects
- Statistics display
- Featured projects showcase
- About and skills sections
- Work experience timeline
- Contact information

### Margin Calculator Domain

A specialized utility for trading calculations:

- Real-time price fetching via API
- Margin position calculation
- Trade history management
- Command generation for trading platforms

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- Yarn (preferred) or npm

### Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Locally preview production build
yarn preview
```

## Development Workflow

### Code Style and Linting

The project uses ESLint and Prettier for code formatting and linting:

```bash
# Run full linting (typecheck, prettier, eslint)
yarn lint

# Run TypeScript typechecking
yarn typecheck

# Run ESLint with auto-fix
yarn lint:js

# Check formatting without changes
yarn lint:prettier

# Auto-format code with Prettier
yarn lint:prettierWrite
```

### Component Development Guidelines

1. Use Vue 3 `<script setup>` SFCs with TypeScript
2. Follow naming conventions: PascalCase for components, kebab-case in templates
3. Group imports by type (Vue, libraries, internal)
4. Use strict typing with TypeScript interfaces for object types
5. Place domain-specific components within their respective domain folders
6. Leverage composables for reusable logic

### Composables

Composables are utility hooks that encapsulate reusable logic:

- **useVisibilityObserver**: Manages section animations based on viewport visibility
- **useCSVParser**: Handles parsing CSV data files
- **useProject**: Manages project data
- **useMarginCalculator**: Core logic for the margin calculator feature

## Deployment

The site is configured for deployment through standard Nuxt 3 build processes. Refer to the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment) for specific hosting options.

## Design Patterns

### Composition API Pattern

The project leverages Vue 3's Composition API for better type safety, code organization, and reusable logic. Key aspects:

- **Reactive References**: Using `ref` and `computed` for reactive state
- **Lifecycle Hooks**: Proper setup with `onMounted`, `onUnmounted`
- **Composables**: Extracting reusable logic into composable functions
- **TypeScript Integration**: Full type safety throughout the application

### Domain-Driven Organization

Code is organized by feature domains rather than technical concerns:

- Each domain contains its own components, composables, and types
- Cross-domain functionality is placed in shared directories
- Clear boundaries between different application features

### Responsive Design Approach

The application follows a mobile-first design approach:

- Responsive layouts that adjust to different screen sizes
- Conditional rendering based on device capabilities
- Performance optimizations for mobile devices

### Data Flow Management

- Props for parent-to-child communication
- Events for child-to-parent communication
- Composables for shared state between components
- Local component state for UI-specific concerns

---

This project demonstrates modern Vue and Nuxt development practices with a focus on maintainability, performance, and user experience.
