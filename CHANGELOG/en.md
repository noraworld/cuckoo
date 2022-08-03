# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com) and this project adheres to [Semantic Versioning](http://semver.org).



## Unreleased
### Added
* Add the option to include a title
* Add the option to remind you to change settings before you take part in

### Changed
* Align the date and time to two digits
* Delete a query parameter from the URL

### Fixed
* Fix that it does not work



## [0.1.0] - 2021-10-31
### Added
* Add an options page
* Add abilities to save settings and sync them across browsers and/or devices logged in the same Google account
* Implement main features of this extension, which observe chat messages on Google Meet be sent, and post them to Slack as is
* Support internationalization
* Add an ability to get notified from Slack
* Add an ability to apply settings as soon as they are modified
* Add an ability to modify settings not only on an options page but also on an popup menu
* Add description about how to create a Slack bot, how to generate a Slack bot token, how to find a Slack user ID, etc.
* Conceal a Slack bot token so that it does not be leaked
* Open a chat box automatically on Google Meet so that this extension works right as soon as the page is loaded
* Change a chat box title color when this extension is ready to work
* Add an ability to enable/disable this extension
* Set a badge text on a popup icon to be easy to understand whether this extension is currently enabled or disabled
* Add an ability to include a Google Meet URL in a Slack message
* Add an extension icon
* Add translation for Japanese
* Localize a Slack first message and date and time
* Release to Chrome Web Store 🎉

### Fixed
* Fix a bug to get notified even though this feature is off on an options page
* Fix a bug that a part of displaying time is parsed as an emoji



[0.1.0]: https://github.com/noraworld/cuckoo/releases/tag/v0.1.0
