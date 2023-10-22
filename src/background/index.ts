import { runtime } from 'webextension-polyfill'
import LibreViewResponse from '../types/libreViewResponse';

runtime.onInstalled.addListener(async () => {
  console.log('[background] loaded')
  fetch('https://api-eu.libreview.io/llu/connections/77dceb9e-9267-e911-815d-0610e6e38cbd/graph', { 
    method: 'GET',
    headers: {
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc3ZGNlYjllLTkyNjctZTkxMS04MTVkLTA2MTBlNmUzOGNiZCIsImZpcnN0TmFtZSI6Ik1hcnRpbiIsImxhc3ROYW1lIjoiRWR2YXJkc2VuIiwiY291bnRyeSI6IlNFIiwicmVnaW9uIjoiZXUiLCJyb2xlIjoicGF0aWVudCIsInVuaXRzIjowLCJwcmFjdGljZXMiOltdLCJjIjoxLCJzIjoibGx1LmFuZHJvaWQiLCJleHAiOjE3MTMzNDA3NDJ9.0eV6321yRc9877OC4Qt6dkSn0_N32uxmLRtqbps9cmQ",
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      "product": "llu.android",
      "version": "4.7"
    }
  }).then(function(res) {
    if (res.status !== 200) {
      console.log("Error, errorcode: " + res.status)
      return;
    }

    res.json().then((response: LibreViewResponse) => console.log(response.data.connection.glucoseItem.Value + " mmol/L"))
  });
})

export {}