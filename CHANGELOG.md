# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Phase 5: Final polish and UX improvements
  - Keyboard shortcuts for all actions (Ctrl+R, Ctrl+S, Ctrl+L, Escape)
  - Enhanced CSS with animations and transitions
  - Improved button focus states and hover effects
  - Responsive design adjustments for smaller screens
  - Keyboard shortcut hints displayed in UI
  - Shortcuts disabled when typing in input fields
  - useKeyboardShortcuts custom hook for reusable keyboard handling
- Phase 5: Glucose notifications
  - Browser notifications for high/low glucose alerts
  - Settings toggle to enable/disable notifications
  - Test notification buttons in settings (preview low/high alerts)
  - useGlucoseNotifications hook for managing notification logic
  - Notification permission handling
  - Alerts only trigger on state change (not repeatedly)
- Phase 5: Enhanced error handling
  - User-friendly error messages in ErrorBoundary
  - Context-aware error explanations (network, session, permissions, timeout)
  - Collapsible technical details for debugging
  - Improved retry functionality with page reload
  - Better visual design for error states
- Phase 5: Accessibility enhancements
  - Focus visible styles for keyboard navigation
  - Improved ARIA labels with shortcut hints
  - Button disabled states during loading
  - Better screen reader announcements
- Phase 4: Data freshness indicator (CRITICAL SAFETY FEATURE)
  - ConnectionStatusIndicator component with three states:
    - ✅ Live data (green) - Data is current
    - ⚠️ Data may be outdated (yellow) - Stale (>2x refresh interval)
    - ❌ No connection (red) - Unable to fetch data
  - Last update timestamp display
  - Browser online/offline event monitoring
  - useConnectionStatus hook for status management
- Phase 4: Glucose trend prediction
  - Linear regression algorithm for glucose forecasting
  - Trend arrows with direction indicators (↗️ ↑ → ↓ ↘️)
  - Predicted glucose value display (e.g., "6.8 mmol/L in 15 min")
  - Dotted prediction line on graph extending 15 minutes into future
  - Color-coded prediction lines (orange=rising, blue=falling, gray=stable)
  - Confidence levels based on data quality
  - trend-prediction.ts utility with comprehensive tests
- Phase 4: Settings panel improvements
  - Refresh interval selector (2/5/10/15 minutes)
  - Minimum 2-minute interval matches CGM scan frequency
  - Preferences persisted to localStorage
  - Smooth animations for panel open/close
- Phase 4: Testing infrastructure
  - Jest configuration with path aliases
  - Test utilities for Chrome API mocking
  - Unit tests for hooks (useGlucoseData, useSensorExpiry, useConnectionStatus)
  - Unit tests for components (GlucoseDisplay, ConnectionStatusIndicator, ErrorBoundary)
  - Unit tests for utilities (trend-prediction)
  - 51 passing tests, 10 skipped (useStorage mock timing issue)
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
- Phase 4: Performance optimizations
  - Memoization of expensive calculations in components
  - Code splitting with chunk files
  - Production build optimizations (console removal, minification)

### Changed
- Phase 5: UI refinements
  - Updated App.css with modern styling
  - Added animations for settings panel (fadeIn, slideIn)
  - Improved button hover and focus states
  - Enhanced error message display
  - Added keyboard shortcut hints
- Phase 4: Architecture refactoring
  - Centralized configuration in `src/config/index.ts`
  - Consolidated types in `src/types/api.ts`
  - Reusable hooks (useStorage, useAuth, useGlucoseData, useSensorExpiry)
  - Extracted components (GlucoseDisplay, LoadingSkeleton)
  - Absolute imports with path aliases
- Phase 4: Timestamp parsing
  - Fixed API timestamp format parsing ("/Date(timestamp)/" → Date)
  - Added parseLibreTimestamp() helper function
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
- Phase 4: Deprecated code
  - Removed console.log statements from production builds
  - Removed individual type definition files (consolidated to api.ts)
  - Removed old hook implementations
  - Removed ESLint configuration (replaced with Biome)
- Phase 2: Deprecated files
  - Removed unused components and utilities

### Fixed
- Phase 5: Error boundary now reloads page on retry for clean state reset
- Phase 5: Keyboard shortcuts properly disabled in input fields
- Phase 4: Target range band now correctly converts mg/dL to mmol/L
- Phase 4: Sensor expiry calculation uses correct API field (sensor.a)
- Phase 4: Button type attributes for accessibility
- Phase 4: Chrome storage mock timing issues in tests
- Phase 2: Graph data undefined check in DevelopmentGraph

## [0.1.0] - 2024-01-01

### Added
- Initial release
- Basic glucose monitoring functionality
- LibreLinkUp API integration
- Glucose trend graph
- Chrome extension structure