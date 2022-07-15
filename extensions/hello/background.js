chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tab.status === 'complete') {
    alert('This is a simple alert!');
  }
});
