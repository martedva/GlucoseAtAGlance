console.log('[content] loaded ')

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
    console.log('[content] onInstalled', reason);
});
