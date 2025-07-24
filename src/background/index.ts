import { getLibreGraph } from '../api/libre/libre-api';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GetLibreViewData") {
    getLibreGraph("77dceb9e-9267-e911-815d-0610e6e38cbd")
      .then((graphData) => {
        sendResponse(graphData);
      })
      .catch(() => {
        sendResponse(undefined);
      })
      .finally(() => {
        return true;
      });;

    return true; 
  }

  return false;
});

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  await chrome.alarms.create('getLibreViewData', 
  {
      delayInMinutes: 0,
      periodInMinutes: 1
  });
});

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

chrome.alarms.onAlarm.addListener(async (alarm) => {
  const graphData = await getLibreGraph( "77dceb9e-9267-e911-815d-0610e6e38cbd");

  if (graphData === undefined) return;

  const color = graphData.data.connection.glucoseItem.MeasurementColor;
  const arrow = graphData.data.connection.glucoseItem.TrendArrow;

  const icon = `${measurementColorDict[color]}-${trendArrowDict[arrow]}`;

  chrome.action.setIcon({
    path: {
      "16": chrome.runtime.getURL(`static/assets/icons/${icon}.png`),
      "32": chrome.runtime.getURL(`static/assets/icons/${icon}.png`),
      "48": chrome.runtime.getURL(`static/assets/icons/${icon}.png`),
      "128": chrome.runtime.getURL(`static/assets/icons/${icon}.png`)
    }
  });
});

export {}