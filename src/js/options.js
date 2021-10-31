function restore() {
  chrome.storage.sync.get({
    extensionPower: false,
    slackChannel: null,
    slackBotToken: null,
    slackMention: false,
    slackUserId: null,
    googleMeetURLIncluded: false
  }, (storage) => {
    document.querySelector('#extension-power input').checked = storage.extensionPower
    if (!document.querySelector('#extension-power input').checked) toggleVisibility('#all-options')
    document.querySelector('#slack-channel input').value = storage.slackChannel
    document.querySelector('#slack-bot-token input').value = storage.slackBotToken
    document.querySelector('#slack-mention input').checked = storage.slackMention
    if (document.querySelector('#slack-mention input').checked) toggleVisibility('#slack-user-id')
    document.querySelector('#slack-user-id input').value = storage.slackUserId
    document.querySelector('#google-meet-url-included input').checked = storage.googleMeetURLIncluded

    chrome.browserAction.setBadgeText({
      text: storage.extensionPower ? 'ON' : 'OFF'
    })
  })
}

function save() {
  let extensionPower = document.querySelector('#extension-power input').checked
  let slackChannel = document.querySelector('#slack-channel input').value
  let slackBotToken = document.querySelector('#slack-bot-token input').value
  let slackMention = document.querySelector('#slack-mention input').checked
  let slackUserId = document.querySelector('#slack-user-id input').value
  let googleMeetURLIncluded = document.querySelector('#google-meet-url-included input').checked

  chrome.storage.sync.set({
    extensionPower: extensionPower,
    slackChannel: slackChannel,
    slackBotToken: slackBotToken,
    slackMention: slackMention,
    slackUserId: slackUserId,
    googleMeetURLIncluded: googleMeetURLIncluded
  }, () => {
    chrome.browserAction.setBadgeText({
      text: extensionPower ? 'ON' : 'OFF'
    })
  })
}

function toggleVisibility(selector) {
  document.querySelector(selector).classList.toggle('invisible')
}

function eventListener() {
  document.querySelector('#extension-power input').addEventListener('change', function(event) {
    toggleVisibility('#all-options')
    save()
  })

  document.querySelector('#slack-channel').addEventListener('submit', function(event) {
    event.preventDefault()
    save()
  })

  document.querySelector('#slack-bot-token').addEventListener('submit', function(event) {
    event.preventDefault()
    save()
  })

  document.querySelector('#slack-mention input').addEventListener('change', function(event) {
    toggleVisibility('#slack-user-id')
    save()
  })

  document.querySelector('#slack-user-id form').addEventListener('submit', function(event) {
    event.preventDefault()
    save()
  })

  document.querySelector('#google-meet-url-included input').addEventListener('change', function(event) {
    save()
  })
}

// Localize by replacing __MSG_***__ meta tags
// https://stackoverflow.com/questions/25467009/internationalization-of-html-pages-for-my-google-chrome-extension#answer-25612056
function localize() {
  let objects = document.querySelectorAll('html');

  for (let i = 0; i < objects.length; i++) {
    let obj = objects[i];
    let valStrH = obj.innerHTML.toString();
    let valNewH = valStrH.replace(/__MSG_(\w+)__/g, (_match, v1) => {
      return v1 ? chrome.i18n.getMessage(v1) : '';
    });

    if (valNewH != valStrH) {
      obj.innerHTML = valNewH;
    }
  }
}

(function() {
  window.addEventListener('DOMContentLoaded', () => {
    localize() // must be loaded at first because if not so, setting event listener will not work
    eventListener()
    restore()
  })
}())
