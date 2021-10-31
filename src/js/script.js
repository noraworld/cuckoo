(function() {
  'use strict'

  var threadId = null
  var prevMessage = null
  var googleMeetURL = null
  let extensionPower
  let slackChannel
  let slackBotToken
  let slackMention
  let slackUserId

  function getOptions() {
    chrome.storage.sync.get({
      extensionPower: false,
      slackChannel: null,
      slackBotToken: null,
      slackMention: false,
      slackUserId: null
    }, (storage) => {
      extensionPower = storage.extensionPower
      slackChannel = storage.slackChannel
      slackBotToken = storage.slackBotToken
      slackMention = storage.slackMention
      slackUserId = storage.slackUserId
    })
  }

  // _namespace is "sync", but is not used for now
  chrome.storage.onChanged.addListener(function (changes, _namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      // because a Slack channel is subject to change
      // a channel and a thread ID need to be corresponded
      threadId = null;

      prevMessage = null;

      getOptions();
    }
  });

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
    if (extensionPower === false) return

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
        endpoint: 'https://slack.com/api/chat.postMessage',
        mention: slackMention,
        userId: slackUserId,
        googleMeetURL: googleMeetURL
      },
      function(response) {
        threadId ||= response.ts
      }
    );
  }

  function prepare() {
    getOptions()
    setChatButtonElement()
  }

  function setChatButtonElement(chatButtonElementTimeoutID) {
    let chatButtonElement = document.querySelectorAll('.VfPpkd-Bz112c-LgbsSe.yHy1rc.eT1oJ.JsuyRc.boDUxc')[2]

    if (chatButtonElement === undefined) {
      let chatButtonElementTimeoutID = setTimeout(function() {
        return setChatButtonElement(chatButtonElementTimeoutID)
      }, RETRY_INTERVAL)
    }
    else {
      // performed only once
      if (chatButtonElementTimeoutID) {
        clearTimeout(chatButtonElementTimeoutID)
        chatButtonElement.click()
        setChatElement()
      }
    }
  }

  function setChatElement(chatElementTimeoutID) {
    let chatElement = document.querySelectorAll('.z38b6')[0]

    if (chatElement === undefined) {
      let chatElementTimeoutID = setTimeout(function() {
        return setChatElement(chatElementTimeoutID)
      }, RETRY_INTERVAL)
    }
    else {
      // performed only once
      if (chatElementTimeoutID) {
        clearTimeout(chatElementTimeoutID)
        observer.observe(chatElement, OBSERVE_CONFIG)
        getGoogleMeetURL()
        ready()
      }
    }
  }

  function getGoogleMeetURL() {
    chrome.runtime.sendMessage(
      {
        contentScriptQuery: 'getGoogleMeetURL',
      },
      function(url) {
        googleMeetURL ||= url
      }
    );
  }

  function ready() {
    let chatBoxHeadStyle = document.querySelector('.CYZUZd').style

    chatBoxHeadStyle.backgroundColor = '#314685';
    chatBoxHeadStyle.color = '#dfdfdf';
  }

  prepare()
}());
