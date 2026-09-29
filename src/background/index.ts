/// <reference types="chrome" />

import { getLibreGraph } from '@/api/libre/libre-api';
import { ALARM_CONFIG, GLUCOSE_COLORS, getIconPaths, SENSOR_CONFIG, TREND_ARROWS } from '@/config';
import { authService } from '@/services/authService';

// Store last glucose value to detect changes
let lastGlucoseValue: number | null = null;
let lastAlertState: { wasLow: boolean; wasHigh: boolean } = { wasLow: false, wasHigh: false };

// Single message listener handling all actions
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  switch (request.action) {
    case 'GetLibreViewData':
      handleGetLibreViewData(sendResponse);
      return true;

    case 'GetToken':
      handleGetToken(sendResponse);
      return true;

    case 'Logout':
      handleLogout(sendResponse);
      return true;

    case 'CheckAuth':
      handleCheckAuth(sendResponse);
      return true;

    case 'ShowNotification':
      handleShowNotification(request, sendResponse);
      return true;

    case 'UpdateIcon':
      handleUpdateIcon(request.color, request.arrow, sendResponse);
      return true;

    case 'ResetAlertState':
      lastAlertState = { wasLow: false, wasHigh: false };
      lastGlucoseValue = null;
      sendResponse({ success: true });
      return true;

    case 'ForceGlucoseCheck':
      handleGlucoseCheck().then(() => {
        sendResponse({ success: true });
      }).catch((err) => {
        console.error('[Background] Force check error:', err);
        sendResponse({ success: false, error: err });
      });
      return true;

    default:
      return false;
  }
});

/**
 * Show a notification using Chrome Notifications API
 */
function handleShowNotification(
  request: { title: string; body: string; type: 'warning' | 'info' },
  sendResponse: (response: { success: boolean }) => void
) {
  if (!chrome.notifications) {
    console.error('[Background] Chrome Notifications API not available');
    sendResponse({ success: false });
    return;
  }

  const notificationId = request.type === 'warning' ? 'glucose-alert' : 'glucose-info';
  
  // Use green stable icon for notifications (not React logo)
  const notificationOptions: chrome.notifications.NotificationOptions = {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('static/assets/icons/green-right-128.png'),
    title: request.title,
    message: request.body,
    priority: request.type === 'warning' ? 2 : 0,
    requireInteraction: true,
  };

  chrome.notifications.create(notificationId, notificationOptions as any, (id) => {
    if (chrome.runtime.lastError) {
      console.error('[Background] Notification error:', chrome.runtime.lastError.message);
      sendResponse({ success: false });
    } else {
      sendResponse({ success: true });
    }
  });
}

/**
 * Update extension icon with color and trend arrow
 */
function handleUpdateIcon(
  color: string,
  arrow: string,
  sendResponse: (response: { success: boolean }) => void
) {
  try {
    chrome.action.setIcon({
      path: getIconPaths(color, arrow),
    });
    sendResponse({ success: true });
  } catch (error) {
    console.error('[Background] Icon update error:', error);
    sendResponse({ success: false });
  }
}

/**
 * Show a glucose notification
 */
function showGlucoseNotification(title: string, body: string, type: 'warning' | 'info') {
  if (!chrome.notifications) {
    console.error('[Background] Chrome Notifications API not available');
    return;
  }

  const notificationId = type === 'warning' ? 'glucose-alert' : 'glucose-info';

  // Use green stable icon for notifications (not React logo)
  const notificationOptions: chrome.notifications.NotificationOptions = {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('static/assets/icons/green-right-128.png'),
    title,
    message: body,
    priority: type === 'warning' ? 2 : 0,
    requireInteraction: true,
  };

  chrome.notifications.create(notificationId, notificationOptions as any, (id) => {
    if (chrome.runtime.lastError) {
      console.error('[Background] Notification error:', chrome.runtime.lastError.message);
    }
  });
}

/**
 * Perform a glucose check and send notifications if needed
 */
async function handleGlucoseCheck() {
  try {
    const patientId = await authService.getPatientId();
    if (!patientId) {
      return;
    }

    const prefs = await chrome.storage.local.get(['user_preferences']);
    const preferences = prefs.user_preferences || {
      refreshInterval: 5,
      notificationsEnabled: false,
    };

    const graphData = await getLibreGraph(patientId);

    if (graphData === undefined || !graphData.data) {
      return;
    }

    const glucoseItem = graphData.data.connection.glucoseItem;
    const glucoseValue = glucoseItem.Value;
    const color = GLUCOSE_COLORS[glucoseItem.MeasurementColor as keyof typeof GLUCOSE_COLORS];
    const arrow = TREND_ARROWS[glucoseItem.TrendArrow as keyof typeof TREND_ARROWS];

    if (!color || !arrow) {
      console.error('[Background] Invalid color or arrow:', { color, arrow });
      return;
    }

    // Always update icon regardless of notification settings
    handleUpdateIcon(color, arrow, () => {});

    // Check for glucose alerts (only if notifications enabled)
    if (preferences.notificationsEnabled) {
      const targetLow = graphData.data.connection.targetLow
        ? graphData.data.connection.targetLow / SENSOR_CONFIG.MMOL_TO_MGDL_FACTOR
        : 4.0;
      const targetHigh = graphData.data.connection.targetHigh
        ? graphData.data.connection.targetHigh / SENSOR_CONFIG.MMOL_TO_MGDL_FACTOR
        : 10.0;

      const isLow = glucoseValue < targetLow;
      const isHigh = glucoseValue > targetHigh;

      if (isLow && !lastAlertState.wasLow) {
        showGlucoseNotification(
          '⚠️ Low Glucose Alert',
          `Your glucose is ${glucoseValue.toFixed(1)} mmol/L (below ${targetLow.toFixed(1)} mmol/L)`,
          'warning'
        );
        lastAlertState.wasLow = true;
        lastAlertState.wasHigh = false;
      } else if (isHigh && !lastAlertState.wasHigh) {
        showGlucoseNotification(
          '⚠️ High Glucose Alert',
          `Your glucose is ${glucoseValue.toFixed(1)} mmol/L (above ${targetHigh.toFixed(1)} mmol/L)`,
          'warning'
        );
        lastAlertState.wasHigh = true;
        lastAlertState.wasLow = false;
      } else if (!isLow && !isHigh) {
        lastAlertState = { wasLow: false, wasHigh: false };
      }

      lastGlucoseValue = glucoseValue;
    }
  } catch (error) {
    console.error('[Background] Error during glucose check:', error);
  }
}

async function handleGetLibreViewData(sendResponse: (response: unknown) => void) {
  try {
    const token = await authService.getToken();

    if (!token) {
      sendResponse({ error: 'Not authenticated' });
      return;
    }

    const graphData = await getLibreGraph(token.patientId);
    sendResponse(graphData);
  } catch (error: unknown) {
    const err = error as { errorCode?: number; message?: string };

    // Handle 401 Unauthorized - token expired
    if (err?.errorCode === 401) {
      await authService.logout();
      sendResponse({ error: 'Session expired. Please log in again.' });
      return;
    }

    sendResponse({ error: err instanceof Error ? err.message : 'Failed to fetch data' });
  }
}

async function handleGetToken(sendResponse: (response: string | null) => void) {
  try {
    const token = await authService.getToken();
    sendResponse(token ? token.token : null);
  } catch {
    sendResponse(null);
  }
}

async function handleLogout(sendResponse: (response: { success: boolean }) => void) {
  try {
    await authService.logout();
    // Clear logbook cache
    await chrome.storage.local.remove(['logbook_data', 'logbook_timestamp']);
    sendResponse({ success: true });
  } catch {
    sendResponse({ success: false });
  }
}

async function handleCheckAuth(sendResponse: (response: { isAuthenticated: boolean }) => void) {
  try {
    const isAuthenticated = await authService.isAuthenticated();
    sendResponse({ isAuthenticated });
  } catch {
    sendResponse({ isAuthenticated: false });
  }
}

// Initialize alarm on extension install AND startup
async function initializeAlarm() {
  try {
    await chrome.alarms.create(ALARM_CONFIG.NAME, {
      delayInMinutes: ALARM_CONFIG.DELAY_MINUTES,
      periodInMinutes: ALARM_CONFIG.PERIOD_MINUTES,
    });
  } catch (error) {
    console.error('[Background] Failed to initialize alarm:', error);
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await initializeAlarm();
});

initializeAlarm();

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_CONFIG.NAME) {
    return;
  }

  await handleGlucoseCheck();
});