console.log('[content] loaded ')

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
    await chrome.alarms.create('demo-default-alarm', 
    {
        delayInMinutes: 0.5,
        periodInMinutes: 1
    });
    console.log("alarm set")
});

chrome.alarms.onAlarm.addListener((alarm) => {
    chrome.runtime.sendMessage({ action: "SetLogo" }, function (response) {
        console.log("setting logo")
        let id = Math.floor(Math.random() * 2);
    
        var logoUrl = id === 1 ? 'assets/arrow-down.png' : 'assets/arrow-up.png';
        console.log("logourl " + logoUrl)
      });

    // if (alarm.name == 'demo-default-alarm') {
    //   chrome.action.setIcon({path: logoUrl});
    // }
  });

export { }