(function() {
  'use strict'

  var threadId = null
  var prevMessage = null
  let slackChannel
  let slackBotToken

  chrome.storage.sync.get({
    slackChannel: null,
    slackBotToken: null
  }, (storage) => {
    slackChannel = storage.slackChannel
    slackBotToken = storage.slackBotToken
  })

  var observer = new MutationObserver((records) => {
    records.forEach((record) => {
      // BEHAVIOR:
      //   return if no elements added (only changed)
      //
      // PURPOSE:
      //   avoid duplicated posting by myself
      //
      // MORE INFO:
      //   it shows a message with grey out
      //   when you send a message but it is not reached
      //   prevent this change from posting to Slack
      if (record.addedNodes.length === 0) return

      let chats = record.target.childNodes
      let message = chats[chats.length - 1].innerText

      // BEHAVIOR:
      //   return if a message is completely the same as previous message
      //
      // PURPOSE:
      //   avoid duplicated posting by myself
      //
      // MORE INFO:
      //   duplicated messages that you intend to send on purpose will be suppressed as well
      //   but I think it is no big deal
      if (message === prevMessage) return

      // BEHAVIOR:
      //   return if current time is not included even though there is a newline
      //
      // PURPOSE:
      //   avoid duplicated posting by myself
      //
      // MORE INFO:
      //   there are two messages by myself detected
      //   the first one is:
      //     You
      //     Hello from Google Meet
      //   the second one is:
      //     You12:34 PM
      //     Hello from Google Meet
      //   the first one has not sent to Google Meet yet
      //   so ignore it to avoid sending duplicated messages to Slack
      //
      // MEMO:
      //   https://stackoverflow.com/questions/21711768/split-string-in-javascript-and-detect-line-break#answer-21712066
      if ((message.match(/\n/g)||[]).length !== 0 && (message.split(/\n/g)[0].match(/\d+:\d+/g)||[]).length === 0) return

      prevMessage = message
      post(message)
    })
  })

  function post(message) {
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Authorization': 'Bearer ' + slackBotToken
    };

    const payload = {
      'channel': slackChannel,
      'text': message,
      'thread_ts': threadId
    }

    chrome.runtime.sendMessage(
      {
        contentScriptQuery: 'postMessage',
        headers: headers,
        payload: payload,
        endpoint: 'https://slack.com/api/chat.postMessage'
      },
      function(response) {
        threadId ||= response.ts
      }
    );
  }

  function prepare() {
    let chatElement = document.querySelectorAll('.z38b6')[0]
    let chatElementTimeoutID

    if (chatElement === undefined) {
      chatElementTimeoutID = setTimeout(function() {
        prepare()
      }, 1000)
    }
    else {
      if (chatElementTimeoutID) {
        clearTimeout(chatElementTimeoutID)
      }

      observer.observe(chatElement, OBSERVE_CONFIG)
    }
  }

  prepare()
}());
