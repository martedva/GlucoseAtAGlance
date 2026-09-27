/// <reference types="chrome" />

import { getLibreGraph } from '../api/libre/libre-api';
import { authService } from '../services/authService';

type NumberToStringDictionary = {
  [key: number]: string;
};

const trendArrowDict: NumberToStringDictionary = {
  1: "down",
  2: "right-down",
  3: "right",
  4: "right-up",
  5: "up"
};

const measurementColorDict: NumberToStringDictionary = {
  1: "green",
  2: "yellow",
  3: "orange",
  4: "red",
}

// Single message listener handling all actions
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "GetLibreViewData":
      handleGetLibreViewData(sendResponse);
      return true;
      
    case "GetToken":
      handleGetToken(sendResponse);
      return true;
      
    case "Logout":
      handleLogout(sendResponse);
      return true;
      
    case "CheckAuth":
      handleCheckAuth(sendResponse);
      return true;
      
    default:
      return false;
  }
});

async function handleGetLibreViewData(sendResponse: (response: any) => void) {
  try {
    const token = await authService.getToken();
    
    if (!token) {
      sendResponse({ error: 'Not authenticated' });
      return;
    }

    const graphData = await getLibreGraph(token.patientId);
    sendResponse(graphData);
  } catch (error: any) {
    // Handle 401 Unauthorized - token expired
    if (error?.errorCode === 401) {
      await authService.logout();
      sendResponse({ error: 'Session expired. Please log in again.' });
      return;
    }
    
    sendResponse({ error: error instanceof Error ? error.message : 'Failed to fetch data' });
  }
}

async function handleGetToken(sendResponse: (response: string | null) => void) {
  try {
    const token = await authService.getToken();
    sendResponse(token ? token.token : null);
  } catch (error) {
    sendResponse(null);
  }
}

async function handleLogout(sendResponse: (response: { success: boolean }) => void) {
  try {
    await authService.logout();
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false });
  }
}

async function handleCheckAuth(sendResponse: (response: { isAuthenticated: boolean }) => void) {
  try {
    const isAuthenticated = await authService.isAuthenticated();
    sendResponse({ isAuthenticated });
  } catch (error) {
    sendResponse({ isAuthenticated: false });
  }
}

// Initialize alarm on extension install
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  await chrome.alarms.create('getLibreViewData', {
    delayInMinutes: 0,
    periodInMinutes: 1
  });
});

// Alarm listener for periodic glucose data updates
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'getLibreViewData') {
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
    const color = glucoseItem.MeasurementColor;
    const arrow = glucoseItem.TrendArrow;

    const icon = `${measurementColorDict[color]}-${trendArrowDict[arrow]}`;

    chrome.action.setIcon({
      path: {
        "16": chrome.runtime.getURL(`static/assets/icons/${icon}-16.png`),
        "48": chrome.runtime.getURL(`static/assets/icons/${icon}-48.png`),
        "128": chrome.runtime.getURL(`static/assets/icons/${icon}-128.png`)
      }
    });
  } catch (error) {
    console.error('[Background] Error updating icon:', error);
  }
});

export {};