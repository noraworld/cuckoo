const postRequest = async(endpoint, headers, body, sendResponse) => {
  fetch(endpoint, {
    'method': 'POST',
    'headers': headers,
    'body': body
  })
  .then((response) => response.json())
  .then((response) => {
    if (response && response.ok) {
      sendResponse(response);
    }
    else {
      console.error(JSON.stringify(response));
      sendResponse({ 'status': 'failed' });
    }
  })
  .catch((err) => {
    console.error(err)
    sendResponse({ 'status': 'failed' });
  });
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg) {
    sendResponse({ 'status': 'listener is missing.\n' + msg });
    return true;
  }

  if (msg.contentScriptQuery === 'postMessage') {
    if (msg.payload['thread_ts'] === null) {
      const foo = (async() => {
        originalText = msg.payload['text']

        if (msg.mention && msg.userId) {
          msg.payload['text'] = '<' + msg.userId + '> Chat log from Google Meet (' + getCurrentTime() + ')'
        }
        else {
          msg.payload['text'] = 'Chat log from Google Meet (' + getCurrentTime() + ')'
        }

        // Why can’t postRequest wait????????????????
        fetch(msg.endpoint, {
          'method': 'POST',
          'headers': msg.headers,
          'body': JSON.stringify(msg.payload)
        })
        .then((response) => response.json())
        .then((response) => {
          if (response && response.ok) {
            sendResponse(response);

            if (response.ts) {
              msg.payload['text'] = originalText
              msg.payload['thread_ts'] = response.ts
              postRequest(msg.endpoint, msg.headers, JSON.stringify(msg.payload), sendResponse)
            }
          }
          else {
            console.error(JSON.stringify(response));
            sendResponse({ 'status': 'failed' });
          }
        })
        .catch((err) => {
          console.error(err)
          sendResponse({ 'status': 'failed' });
        });
      })()
    }
    else {
      postRequest(msg.endpoint, msg.headers, JSON.stringify(msg.payload), sendResponse)
    }

    return true
  }
})

chrome.runtime.onInstalled.addListener((object) => {
  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({
      url: chrome.extension.getURL('options.html')
    });
  }
});

function getCurrentTime() {
  let today    = new Date()
  let date     = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
  let time     = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds()
  let datetime = date + ' ' + time

  return datetime
}
