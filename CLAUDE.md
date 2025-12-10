# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm install          # Install dependencies
npx expo start       # Start development server (options for iOS/Android/web in output)
npm run android      # Start on Android
npm run ios          # Start on iOS
npm run web          # Start on web
npm run lint         # Run ESLint
npm run reset-project # Move app/ to app-example/ and create fresh app/
```

## Architecture

This is a React Native Expo app using file-based routing (expo-router) with TypeScript.

### Project Structure
- `app/` - File-based routes using expo-router. `_layout.tsx` files define navigation structure
- `app/(tabs)/` - Tab navigation group with Home and Explore tabs
- `components/` - Reusable UI components (ThemedText, ThemedView, etc.)
- `constants/theme.ts` - Color palette and font definitions for light/dark modes
- `hooks/` - Custom hooks including `use-color-scheme` and `use-theme-color`

### Key Patterns
- **Theming**: Uses `@react-navigation/native` ThemeProvider with automatic dark/light mode. Theme colors defined in `constants/theme.ts`, accessed via `useThemeColor` hook
- **Path aliases**: `@/*` maps to project root (configured in tsconfig.json)
- **Navigation**: expo-router Stack with tabs group nested inside. Modal screens use `presentation: 'modal'`
- **Typed routes**: Experimental typed routes enabled (`experiments.typedRoutes` in app.json)
- **React Compiler**: Experimental React compiler enabled
