# Glucose At A Glance

A Chrome extension for monitoring glucose levels from LibreLinkUp. View your continuous glucose monitoring (CGM) data at a glance with real-time updates, trend visualization, and customizable alerts.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18.2-blue)

## Features

- 📊 **Real-time Glucose Monitoring**: View current glucose levels with trend arrows
- 📈 **Interactive Graph**: Visualize glucose trends with 15-minute prediction overlay
- 🔮 **Trend Prediction**: See where your glucose is heading (rising/falling/stable)
- 🟢 **Data Freshness Indicator**: Know instantly if data is live, stale, or offline
- ⚠️ **Smart Alerts**: Color-coded glucose levels (green/yellow/orange/red)
- 📅 **Sensor Tracking**: Monitor sensor expiry with warning notifications
- 💾 **Data Export**: Export your glucose data to CSV or JSON formats
- ⚙️ **Customizable Settings**: Adjust refresh intervals and notification preferences
- ♿ **Accessible**: WCAG compliant with full keyboard navigation and screen reader support
- 🔒 **Secure**: Credentials stored locally, never sent to third parties
- ⌨️ **Keyboard Shortcuts**: Quick access to all features without mouse

## Installation

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store
2. Search for "Glucose At A Glance"
3. Click "Add to Chrome"

### Manual Installation (Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/GlucoseAtAGlance.git
   cd GlucoseAtAGlance
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `build` folder

## Usage

### First Time Setup

1. Click the extension icon in your Chrome toolbar
2. Enter your LibreLinkUp email and password
3. Click "Sign In"
4. Your glucose data will load automatically

### Features

- **Refresh Data**: Click the refresh button (🔄) or press `Ctrl+R` to manually update glucose readings
- **Settings**: Click the gear icon (⚙️) or press `Ctrl+S` to customize:
  - Refresh interval (2/5/10/15 minutes)
  - Enable/disable browser notifications for high/low glucose alerts
  - Test notification buttons to preview alert appearance
- **Logout**: Click the logout button (↗️) or press `Ctrl+L` to sign out
- **Data Freshness**: Check the status indicator at the top:
  - ✅ **Live data** (green) - Data is current
  - ⚠️ **Data may be outdated** (yellow) - Data is stale (>2x refresh interval)
  - ❌ **No connection** (red) - Unable to fetch data
- **Trend Prediction**: View the trend arrow and predicted glucose value:
  - ↗️ Rising - Glucose is increasing
  - ↑ Rising fast - Glucose is increasing rapidly
  - → Stable - Glucose is stable
  - ↓ Falling fast - Glucose is decreasing rapidly
  - ↘️ Falling - Glucose is decreasing
  - Dotted line on graph shows 15-minute prediction
- **Glucose Notifications**: Get browser notifications when glucose goes outside target range
  - Enable in Settings panel
  - Test alerts with "Test Low Alert" and "Test High Alert" buttons
  - Only notifies on state change (not repeatedly for same condition)

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+R` or `Cmd+R` | Refresh data |
| `Ctrl+S` or `Cmd+S` | Open settings |
| `Ctrl+L` or `Cmd+L` | Logout |
| `Escape` | Close settings panel |

**Note**: Shortcuts are disabled when typing in input fields to avoid conflicts.

## Architecture

### Project Structure

```
GlucoseAtAGlance/
├── src/
│   ├── api/           # API integration (LibreLinkUp)
│   ├── components/    # React components
│   ├── config/        # Configuration constants
│   ├── hooks/         # Custom React hooks
│   ├── popup/         # Extension popup UI
│   ├── background/    # Service worker (background script)
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── assets/            # Icons and static assets
├── public/            # Extension manifest and static files
├── .github/           # GitHub Actions workflows
└── build/             # Production build output
```

### Technology Stack

- **Frontend**: React 18, TypeScript
- **State Management**: React Hooks (useState, useReducer, useContext)
- **Data Fetching**: Custom hooks with SWR-like caching
- **Visualization**: Observable Plot
- **Styling**: CSS Modules
- **Build Tool**: React App Rewired (custom Webpack config)
- **Testing**: Jest, React Testing Library
- **Linting**: Biome

### Key Components

- `App.tsx`: Main application component with authentication state
- `GlucoseDisplay.tsx`: Shows current glucose value, trend arrow, and predicted value
- `DevelopmentGraph.tsx`: Interactive glucose trend graph with prediction overlay
- `ConnectionStatusIndicator.tsx`: Data freshness status (live/stale/offline)
- `LoginForm.tsx`: User authentication
- `SettingsPanel.tsx`: User preferences (refresh interval)
- `ErrorBoundary.tsx`: Graceful error handling with user-friendly messages
- `useConnectionStatus.ts`: Hook for monitoring data freshness
- `trend-prediction.ts`: Linear regression algorithm for glucose forecasting

## Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Generate icons
npm run icons
```

### Environment Variables

Create a `.env` file in the root directory for development:

```env
REACT_APP_API_BASE_URL=https://api-eu.libreview.io
REACT_APP_API_VERSION=4.16.0
```

### Testing

Run the test suite:

```bash
npm test
```

Run with coverage:

```bash
npm test -- --coverage
```

### Code Quality

This project uses Biome for linting and formatting:

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix

# Format all files
npm run format
```

## API Integration

This extension connects to the LibreLinkUp API to fetch glucose data. The API integration is handled by:

- `src/api/libre/libre-api.ts`: API client with authentication
- `src/services/authService.ts`: Token management
- `src/background/index.ts`: Background service worker for API calls

### Rate Limiting

The extension respects API rate limits:
- Default refresh interval: 5 minutes
- Minimum refresh interval: 1 minute
- Automatic backoff on errors

## Privacy & Security

- **Local Storage**: All credentials are stored in Chrome's local storage
- **No Third-Party Tracking**: No analytics or tracking services
- **Secure Communication**: All API calls use HTTPS
- **Minimal Permissions**: Only requires necessary Chrome permissions

### Permissions

```json
{
  "storage": "Store authentication tokens",
  "alarms": "Schedule periodic data refreshes",
  "host_permissions": ["https://api-eu.libreview.io/*"]
}
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style (enforced by Biome)
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## Troubleshooting

### Common Issues

**Extension not loading data:**
- Check your internet connection
- Verify your LibreLinkUp credentials
- Try logging out and back in

**Graph not displaying:**
- Ensure you have at least one glucose reading
- Check browser console for errors

**Sensor expiry showing incorrectly:**
- The sensor activation date is fetched from the API
- Contact support if the date seems incorrect

### Getting Help

- Check the [Issues](https://github.com/yourusername/GlucoseAtAGlance/issues) page
- Open a new issue with details about your problem

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This extension is not affiliated with or endorsed by Abbott Diabetes Care Ltd. LibreLinkUp is a trademark of Abbott Diabetes Care Ltd. This extension is for informational purposes only and should not be used for medical decisions. Always consult with your healthcare provider for medical advice.

## Acknowledgments

- [LibreLinkUp](https://www.libreviewup.com/) for their API
- [Observable Plot](https://observablehq.com/plot/) for data visualization
- [React](https://react.dev/) for the UI framework
- [Biome](https://biomejs.dev/) for code quality tools

---

Built with ❤️ for the diabetes community