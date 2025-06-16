# MomentScience QA Tools - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a SvelteKit-based internal web tool for the MomentScience testing team. The application provides an API Request Builder with additional testing utilities for QA and development teams.

## Technology Stack
- **Frontend Framework**: SvelteKit with TypeScript
- **Styling**: Tailwind CSS with custom component classes
- **Icons**: Lucide Svelte
- **Build Tool**: Vite
- **Package Manager**: npm

## Project Structure
- `src/lib/components/` - Reusable Svelte components
- `src/lib/types.ts` - TypeScript type definitions
- `src/lib/storage.ts` - LocalStorage utilities
- `src/lib/api-utils.ts` - API helper functions
- `src/routes/` - SvelteKit pages and layouts
- `src/app.css` - Global styles with Tailwind directives

## Coding Standards

### TypeScript
- Use strict TypeScript with proper type definitions
- Export types from `src/lib/types.ts`
- Use proper typing for component props and events

### Svelte Components
- Use `<script lang="ts">` for TypeScript support
- Follow the component structure: script, markup, style
- Use reactive statements (`$:`) for derived values
- Dispatch custom events with proper typing
- Use `bind:` for two-way data binding

### Styling
- Use Tailwind CSS utility classes
- Follow the custom component classes defined in `app.css`
- Use responsive design patterns (`md:`, `lg:`, etc.)
- Follow MomentScience brand colors defined in Tailwind config

### State Management
- Use Svelte stores for cross-component state
- Use localStorage for persistent data via `storage.ts` utilities
- Handle loading and error states appropriately

### API Integration
- Use the utilities in `api-utils.ts` for API operations
- Follow the API preset patterns for MomentScience endpoints
- Handle CORS and network errors gracefully
- Validate JSON inputs before sending requests

## Component Guidelines

### Input Components
- Use `InputField.svelte` for text inputs with validation
- Use `SelectField.svelte` for dropdowns
- Include tooltips for user guidance
- Implement proper error handling and display

### UI Components
- Use `Button.svelte` with appropriate variants
- Use `Modal.svelte` for overlays and dialogs
- Follow loading states and disabled states
- Implement proper accessibility attributes

### Layout
- Use responsive grid layouts
- Follow the sidebar navigation pattern
- Use `section-card` class for content sections
- Maintain consistent spacing with Tailwind utilities

## API Endpoints
The tool supports MomentScience API endpoints:
- Moments API (`/native/v2/offers.json`)
- Perkswall API (`/native/v4/perkswall.json`)
- USP Session APIs (`/sdk/v4/usp/...`)

## Development Workflow
1. Use `npm run dev` for development server
2. Follow the existing component patterns
3. Test API requests with both staging and production environments
4. Validate TypeScript types and fix any errors
5. Ensure responsive design works on mobile and desktop

## Best Practices
- Write helpful comments for complex logic
- Use semantic HTML elements
- Implement proper error boundaries
- Follow accessibility guidelines
- Keep components focused and reusable
- Use consistent naming conventions
- Handle edge cases and empty states

## Brand Guidelines
- Use Inter font family
- Follow MomentScience color scheme (indigo primary, emerald accent)
- Maintain professional, clean UI design
- Use MS logo placeholder until real logo is provided
