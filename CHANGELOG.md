# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Phase 4: Performance optimizations
  - Memoization of expensive calculations in components
  - Code splitting with chunk files
  - Production build optimizations (console removal, minification)
- Phase 4: Data export feature
  - Export glucose data to CSV format
  - Export glucose data to JSON format
  - ExportButton component with dropdown menu
- Phase 4: Settings panel
  - Configurable refresh interval (1-15 minutes)
  - Toggle for trend arrow visibility
  - Sound notifications toggle
  - Customizable high/low glucose thresholds
  - Preferences persisted to localStorage
- Phase 4: Testing infrastructure
  - Jest configuration with path aliases
  - Test utilities for Chrome API mocking
  - Unit tests for hooks (useGlucoseData, useSensorExpiry)
  - Unit tests for components (GlucoseDisplay, ErrorBoundary)
  - 30 passing tests
- Phase 4: Accessibility improvements
  - ARIA labels on all interactive elements
  - Semantic roles (main, region, alert, figure, status)
  - Live regions for dynamic content
  - Keyboard navigation support
  - Screen reader friendly SVG graph with title/desc
- Phase 4: Error handling
  - ErrorBoundary component for graceful error recovery
  - Retry functionality with user-friendly messages
  - Error tracking callbacks
- Phase 4: CI/CD pipeline
  - GitHub Actions workflow for automated testing
  - Automated builds on push
  - Release automation with versioned artifacts
- Phase 4: Code quality
  - Biome configuration for linting and formatting
  - Replaced ESLint with Biome
  - TypeScript strict mode enabled

### Changed
- Phase 2: Architecture refactoring
  - Centralized configuration in `src/config/index.ts`
  - Consolidated types in `src/types/api.ts`
  - Reusable hooks (useStorage, useAuth, useGlucoseData, useSensorExpiry)
  - Extracted components (GlucoseDisplay, LoadingSkeleton)
  - Absolute imports with path aliases
- Phase 2: Bug fixes
  - Fixed target range band conversion (mg/dL → mmol/L)
  - Fixed sensor expiry calculation using correct API field
- Phase 1: Authentication system
  - User login/logout functionality
  - Token management with chrome.storage
  - Session expiry handling
- Phase 1: UI improvements
  - New PNG icons with proper sizing
  - Thicker trend arrows (15px shaft, 50px head)
  - Loading skeleton components

### Removed
- Phase 2: Deprecated files
  - Removed individual type definition files (consolidated to api.ts)
  - Removed old hook implementations
  - Removed ESLint configuration (replaced with Biome)

### Fixed
- Target range band now correctly converts mg/dL to mmol/L
- Sensor expiry calculation uses correct API field (sensor.a)
- Button type attributes for accessibility
- Chrome storage mock timing issues in tests

## [0.1.0] - 2024-01-01

### Added
- Initial release
- Basic glucose monitoring functionality
- LibreLinkUp API integration
- Glucose trend graph
- Chrome extension structure