function restore() {
  chrome.storage.sync.get({
    slackChannel: null,
    slackBotToken: null
  }, (storage) => {
    document.querySelector('#slack-channel input').value = storage.slackChannel
    document.querySelector('#slack-bot-token input').value = storage.slackBotToken
  })
}

function save() {
  let slackChannel  = document.querySelector('#slack-channel input').value
  let slackBotToken = document.querySelector('#slack-bot-token input').value

  chrome.storage.sync.set({
    slackChannel: slackChannel,
    slackBotToken: slackBotToken
  })
}

function eventListener() {
  document.querySelector('#slack-channel').addEventListener('submit', function(event) {
    event.preventDefault()
    save()
  })

  document.querySelector('#slack-bot-token').addEventListener('submit', function(event) {
    event.preventDefault()
    save()
  })
}

(function() {
  window.addEventListener('DOMContentLoaded', () => {
    eventListener()
    restore()
  })
}())
