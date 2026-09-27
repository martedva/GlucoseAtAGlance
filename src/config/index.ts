/**
 * Application Configuration
 * Centralized constants and settings for the extension
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://api-eu.libreview.io/llu',
  VERSION: '4.16.0',
  PRODUCT: 'llu.android',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  PATIENT_ID: 'patient_id',
} as const;

// Sensor Configuration
export const SENSOR_CONFIG = {
  LIFETIME_DAYS: 14,
  MMOL_TO_MGDL_FACTOR: 18.01554,
} as const;

// Glucose Range Thresholds (mmol/L)
export const GLUCOSE_THRESHOLDS = {
  LOW: 3.9,
  HIGH: 10.0,
  CRITICAL_LOW: 3.0,
  CRITICAL_HIGH: 15.0,
} as const;

// Trend Arrow Mappings
export const TREND_ARROWS = {
  1: 'down' as const,
  2: 'right-down' as const,
  3: 'right' as const,
  4: 'right-up' as const,
  5: 'up' as const,
} as const;

export type TrendArrowKey = keyof typeof TREND_ARROWS;

// Color Mappings (Glucose Level → Icon Color)
export const GLUCOSE_COLORS = {
  1: 'green' as const,
  2: 'yellow' as const,
  3: 'orange' as const,
  4: 'red' as const,
} as const;

export type GlucoseColorKey = keyof typeof GLUCOSE_COLORS;

// Icon Configuration
export const ICON_CONFIG = {
  SIZES: [16, 48, 128] as const,
  ARROW_THICKNESS: 15,
  ARROW_LENGTH: 35,
  ARROW_HEAD_WIDTH: 50,
} as const;

// Alarm Configuration
export const ALARM_CONFIG = {
  NAME: 'getLibreViewData',
  DELAY_MINUTES: 0,
  PERIOD_MINUTES: 1,
} as const;

// UI Configuration
export const UI_CONFIG = {
  POPUP_WIDTH: 640,
  POPUP_HEIGHT: 600,
  SENSOR_EXPIRY_WARNING_DAYS: 3,
  SENSOR_EXPIRY_CRITICAL_DAYS: 1,
} as const;

// Helper Functions
export const getTrendArrow = (code: number): string | undefined => {
  return TREND_ARROWS[code as TrendArrowKey];
};

export const getGlucoseColor = (code: number): string | undefined => {
  return GLUCOSE_COLORS[code as GlucoseColorKey];
};

export const getIconPath = (color: string, arrow: string, size: number): string => {
  return chrome.runtime.getURL(`static/assets/icons/${color}-${arrow}-${size}.png`);
};

export const getIconPaths = (color: string, arrow: string): Record<string, string> => {
  return {
    16: getIconPath(color, arrow, 16),
    48: getIconPath(color, arrow, 48),
    128: getIconPath(color, arrow, 128),
  };
};