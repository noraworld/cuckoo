'use strict'

const RETRY_INTERVAL = 3000

const ELEMENTS = {
  messages: 'KHxj8b tL9Q4c', // not used
  title: '.u6vdEc.ouH3xe',
  chat: {
    element: '.z38b6',
    index: 0
  },
  chatButton: {
    element: '.VfPpkd-Bz112c-LgbsSe.yHy1rc.eT1oJ.JsuyRc.boDUxc',
    index: 2
  },
  chatBoxHead: '.CYZUZd'
}

const STYLE = {
  chatBoxHeadColor: '#dfdfdf',
  chatBoxHeadBackgroundColor: '#314685'
}

const INPUT_AREA = 'textarea[name="chatTextInput"]' // not used

const OBSERVE_CONFIG = {
  attributes: true,
  subtree: true,
  childList: true,
  characterData: true,
  attributeFilter: ['data-message-text']
}
