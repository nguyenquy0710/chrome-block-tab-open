let targetUrl = 'https://blogs.nhquydev.net/?utm_source=chrome&utm_medium=extension&utm_campaign=block-opening-tabs',
    blackList = [
        '.*hhpanda\.tv.*',
        '.*hh3dhay\.com.*',
        '.*hhhkungfu\.tv.*',
        '.*hoathinh3d\.fun.*',
        '.*hoathinh3d.*',
    ], targetList = [
        'https://blogs.nhquydev.net',
    ];

chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({ 'blacklist': blackList }, function () {
        console.log('Blacklist initialized!');
    });
});

chrome.runtime.onStartup.addListener(function () {
    console.log('Extension started!');
});

// Listen for new tabs being created
chrome.tabs.onCreated.addListener(function (tab) {
    console.log(JSON.stringify(tab));

    let isByPass = false,
        windowId = tab.windowId,
        pendingUrl = tab.windowId;

    isByPass = pendingUrl == 'chrome://newtab/';

    if (!isByPass) {
        chrome.tabs.query({ windowId: windowId }, function (tabs) {
            // console.log(JSON.stringify(tabs));

            let previousTab = null;
            for (let i = 0; i < tabs.length; i++) {
                if (tabs[i].id === tab.id) {
                    if (i > 0) {
                        previousTab = tabs[i - 1];
                    }
                    break;
                }
            }
            console.log("🚀 Nqdev: previousTab", previousTab); // previous tab object or null

            chrome.storage.sync.get(['blacklist'], function (result) {
                // Check if the new tab is on a blocked URL
                let isBlocked = false;
                result.blacklist.forEach(pattern => {
                    let regex = new RegExp(pattern);
                    if (regex.test(previousTab?.url)) {
                        isBlocked = true;
                        // Remove the tab
                        // chrome.tabs.remove(tab.id);
                        chrome.tabs.update(tab.id, { active: true, url: `${targetUrl}&previous_url=${encodeURIComponent(previousTab?.url)}&pending_url=${encodeURIComponent(tab?.pendingUrl)}` });
                        return;
                    }
                });
                console.log(`previousTab: ${isBlocked} -> previousTab.url: ${previousTab?.url}`); // true or false
            });
        });

        chrome.storage.sync.get(['blacklist'], function (result) {
            // Check if the new tab is on a blocked URL
            let isBlocked = false;
            result.blacklist.forEach(pattern => {
                let regex = new RegExp(pattern);
                if (regex.test(tab?.pendingUrl) || regex.test(tab?.url)) {
                    isBlocked = true;
                    // Remove the tab
                    // chrome.tabs.remove(tab.id);
                    chrome.tabs.update(tab.id, { active: true, url: `${targetUrl}&previous_url=${encodeURIComponent(previousTab?.url)}&pending_url=${encodeURIComponent(tab?.pendingUrl)}` });
                    return;
                }
            });
            console.log(`current: ${isBlocked} -> tab.pendingUrl: ${tab?.pendingUrl} -> tab.url: ${tab?.url}`); // true or false
        });
    }
});

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs[0]?.url.startsWith('chrome://')) {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id, allFrames: true },
            func: function () {
                chrome.storage.sync.get(['blacklist'], function (result) {
                    if (result.blacklist.includes(location.host)) {
                        window.close();
                    }
                });
            }
        });
    }
});
