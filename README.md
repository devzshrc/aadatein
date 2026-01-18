# Aadatein

## System Design
Built as an offline-first React Native application using Expo.

### Tech Stack
- **Framework**: Expo (Managed Workflow)
- **Language**: TypeScript
- **UI Library**: React Native (Core components) + SVG
- **Persistence**: AsyncStorage (Local JSON storage)
- **Navigation**: Conditional Rendering / React Navigation (planned)

### Architecture
The app follows a simple uni-directional data flow:
1.  **State**: Managed in the root component (`App.tsx`) using React Hooks.
2.  **Persistence**: Changes to the `habits` state are asynchronously persisted to local storage.
3.  **Logic**: Streak calculations and date logic are isolated in pure utility functions (`streakLogic.ts`).

## Directory Structure
- `src/types`: TypeScript interfaces defining the data model.
- `src/utils`: Core business logic (streaks) and storage wrappers.
- `src/components`: Reusable UI components (BottomTabs, ProgressRing).
- `src/screens`: Full-page views containing feature logic.

## Build Process
The project uses EAS (Expo Application Services) for building native binaries.

### Development
```bash
npm install
npx expo start
```

### Production Build (Android APK)
```bash
npx eas-cli build -p android --profile preview
```
This compiles the Javascript bundle and native code into a standalone APK file.
