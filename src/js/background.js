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

        msg = buildFirstSlackMessage(msg)

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
              msg.payload['blocks'] = null
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
  else if (msg.contentScriptQuery === 'getGoogleMeetURL') {
    // "chrome.tabs.query" cannot be used in content scripts
    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    }, (tabs) => {
      sendResponse(tabs[0].url);
    });

    return true;
  }
})

chrome.runtime.onInstalled.addListener((object) => {
  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({
      url: chrome.runtime.getURL('options.html')
    });
  }
});

function buildFirstSlackMessage(message) {
  let text
  let fields

  message.payload['text'] = null

  // NOTE:
  //   Due to a bug on Chromium, chrome.i18n.getMessage() cannot be
  //   used in Manifest V3, it can be used in Manifest V2 though
  //
  //   This bug would be fixed in the future, but
  //   chrome.i18n.getMessage() turns to be disabled until this bug
  //   exists
  //
  //   cf. https://groups.google.com/a/chromium.org/g/chromium-extensions/c/dG6JeZGkN5w
  //       https://cofus.blog/posts/when-chromei18ngetmessage-cannot-be-obtained-with-service-worker (ja)

  if (message.mention && message.userId) {
    // text = `<${message.userId}> ${chrome.i18n.getMessage('slack_first_message_text')}`
    text = `<${message.userId}> Chat log from Google Meet`
  }
  else {
    // text = chrome.i18n.getMessage('slack_first_message_text')
    text = 'Chat log from Google Meet'
  }

  if (isGoogleMeetURL(message.googleMeetURL) && message.googleMeetURLIncluded) {
    fields = [
      {
        'type': 'mrkdwn',
        'text': '*URL*:'
      },
      {
        'type': 'mrkdwn',
        // 'text': `*${chrome.i18n.getMessage('date_and_time')}*:`
        'text': `*Date and Time*:`
      },
      {
        'type': 'mrkdwn',
        'text': message.googleMeetURL
      },
      {
        'type': 'plain_text',
        'text': getCurrentTime(),
        'emoji': false
      }
    ]
  }
  else {
    fields = [
      {
        'type': 'mrkdwn',
        // 'text': `*${chrome.i18n.getMessage('date_and_time')}*:`
        'text': `*Date and Time*:`
      },
      {
        'type': 'plain_text',
        'text': ' ' // empty
      },
      {
        'type': 'plain_text',
        'text': getCurrentTime(),
        'emoji': false
      },
      {
        'type': 'plain_text',
        'text': ' ' // empty
      },
    ]
  }

  message.payload['blocks'] = [
    {
      'type': 'section',
      'text': {
        'text': text,
        'type': 'mrkdwn',
      },
      'fields': fields
    }
  ]

  return message
}

// https://bobbyhadz.com/blog/javascript-format-date-yyyymmdd
// https://zenn.dev/terrierscript/articles/2020-09-19-time-sv-se
function getCurrentTime() {
  return new Date().toLocaleString('sv-SE')
}

function isGoogleMeetURL(url) {
  if (!url) return false

  return (url.match(/^https:\/\/meet\.google\.com\//g)||[]).length !== 0
}
