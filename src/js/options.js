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

// https://stackoverflow.com/questions/25467009/internationalization-of-html-pages-for-my-google-chrome-extension#answer-25612056
function localize() {
    //Localize by replacing __MSG_***__ meta tags
    var objects = document.getElementsByTagName('html');
    for (var j = 0; j < objects.length; j++)
    {
        var obj = objects[j];

        var valStrH = obj.innerHTML.toString();
        var valNewH = valStrH.replace(/__MSG_(\w+)__/g, function(match, v1)
        {
            return v1 ? chrome.i18n.getMessage(v1) : "";
        });

        if(valNewH != valStrH)
        {
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
