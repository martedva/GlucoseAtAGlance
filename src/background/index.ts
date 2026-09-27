/// <reference types="chrome" />

import { getLibreGraph } from '@/api/libre/libre-api';
import { ALARM_CONFIG, GLUCOSE_COLORS, getIconPaths, TREND_ARROWS } from '@/config';
import { authService } from '@/services/authService';

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

    default:
      return false;
  }
});

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

// Initialize alarm on extension install
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.alarms.create(ALARM_CONFIG.NAME, {
    delayInMinutes: ALARM_CONFIG.DELAY_MINUTES,
    periodInMinutes: ALARM_CONFIG.PERIOD_MINUTES,
  });
});

// Alarm listener for periodic glucose data updates
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_CONFIG.NAME) {
    return;
  }

  try {
    const patientId = await authService.getPatientId();
    if (!patientId) {
      return;
    }

    const graphData = await getLibreGraph(patientId);

    if (graphData === undefined || !graphData.data) {
      return;
    }

    const glucoseItem = graphData.data.connection.glucoseItem;
    const color = GLUCOSE_COLORS[glucoseItem.MeasurementColor as keyof typeof GLUCOSE_COLORS];
    const arrow = TREND_ARROWS[glucoseItem.TrendArrow as keyof typeof TREND_ARROWS];

    if (!color || !arrow) {
      console.error('[Background] Invalid color or arrow:', { color, arrow });
      return;
    }

    chrome.action.setIcon({
      path: getIconPaths(color, arrow),
    });
  } catch (error) {
    console.error('[Background] Error updating icon:', error);
  }
});
