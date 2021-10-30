'use strict'

const CLASS_OBJ = {
  thread: 'z38b6',
  messages: 'KHxj8b tL9Q4c'
}
const INPUT_AREA = 'textarea[name="chatTextInput"]'
const OBSERVE_CONFIG = {
  attributes: true,
  subtree: true,
  childList: true,
  characterData: true,
  attributeFilter: ['data-message-text']
}
