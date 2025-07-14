import LibreViewResponse from '../types/libreViewResponse';
import LoginResponse from '../types/loginResponse';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "GetLibreViewData") {
    FetchGlucose().then((result) => {
      sendResponse(result);
    });
  }

  return true;
});

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  await chrome.alarms.create('demo-default-alarm', 
  {
      delayInMinutes: 0,
      periodInMinutes: 1
  });
});

const FetchGlucose = async () => {
  // ZUSTAND AND TANSTACK QUERY
  const token = GetAuthToken("mart.edva@gmail.com", "!!Vw1303b10!!");

  const res = await fetch('https://api-eu.libreview.io/llu/connections/77dceb9e-9267-e911-815d-0610e6e38cbd/graph', {
    method: 'GET',
    headers: {
      "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc3ZGNlYjllLTkyNjctZTkxMS04MTVkLTA2MTBlNmUzOGNiZCIsImZpcnN0TmFtZSI6Ik1hcnRpbiIsImxhc3ROYW1lIjoiRWR2YXJkc2VuIiwiY291bnRyeSI6IlNFIiwicmVnaW9uIjoiZXUiLCJyb2xlIjoicGF0aWVudCIsInMiOiJsbHUuYW5kcm9pZCIsInNpZCI6IjRiZTMzOTU2LWNkNDAtNDZmOS1hNTBmLWRjNTBhOWUzYzI4YiIsImV4cCI6MTc2MDYxMjMxMiwiaWF0IjoxNzQ1MDYwMzEyLCJqdGkiOiI3ZTE5ZmRiOS0zOWQ2LTRhOWQtYjhkMi1jMzczYWFjZTQ2NGYifQ.BGgd7ia_Om7ZlNMY1eN6xuTv5yiQsDqPzv7z4dF8s1U`,
      "Content-Type": "application/json",
      "product": "llu.android",
      "version": "4.12.0",
      "account-Id": "2018c7d281c7fde1daac4c2cefc77479230120d2cc9bf9e2eff99b0d3451ada0" // SHA256 encoding of ID from User endpoint
    }
  });

  if (res.status !== 200) {
    console.log("Error, errorcode: " + res.status);
    return;
  }

  var json = res.json().then((response: LibreViewResponse) => { return response.data; });

  return json;
} 

const GetAuthToken = async (username: string, password: string) => {
  const res = await fetch('https://api-eu.libreview.io/llu/auth/login', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "product": "llu.android",
      "version": "4.12"
    },
    body: JSON.stringify({
      email: username,
      password: password,
    })
  });

  if (res.status !== 200) {
    console.log("Error, errorcode: " + res.status);
    return;
  }

  await res.json().then((response: LoginResponse) => {
    return response.data.authTicket.token;
  });
}

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
  0: "red",
  1: "green",
  2: "yellow",
  3: "orange",
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  const response = await FetchGlucose();

  if (response === undefined) return;

  const color = response.connection.glucoseItem.MeasurementColor;
  const arrow = response.connection.glucoseItem.TrendArrow;

  const icon = `${measurementColorDict[color]}-${trendArrowDict[arrow]}`;

  chrome.action.setIcon({
    path: {
      "16": chrome.runtime.getURL(`static/assets/icons/${icon}.png`),
      "32": chrome.runtime.getURL(`static/assets/icons/${icon}.png`),
      "48": chrome.runtime.getURL(`static/assets/icons/${icon}.png`),
      "128": chrome.runtime.getURL(`static/assets/icons/${icon}.png`)
    }
  });
  
  // let id = Math.floor(Math.random() * 2);

  // var logoUrl = id == 1 ? 'assets/arrow-down.png' : 'assets/arrow-up.png'
  
  // chrome.runtime.sendMessage({ action: "GetLogo" }, function (response) {
  // });

  // if (alarm.name == 'demo-default-alarm') {
  //   chrome.action.setIcon({path: logoUrl});
  // }
});

export {}