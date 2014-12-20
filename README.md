Hotspot (Work in Progress) [![Build Status](https://travis-ci.org/willeponken/hotspot.svg)](https://travis-ci.org/willeponken/hotspot)
=======

Captive portal for CJDNS

## TODO
- [x] Don't use a upload form for the cjdroute.conf (security problems)
- [ ] Work out how this should be done?

## Vision
The idea is to have a CJDNS-only network, but before that, people want to be able to access the Internet.
This ~~is a~~ will be a general purpose captive portal, but as I'm in quite a hurry for my school project (inter alia this) there is some hardcoded stuff.

## Contribute
I appreciate contributions, but also scolding for mistakes, etc.

## Deploy & setup
### Easy way
`npm install && npm start`

### Custom way
Download all dependenices with `npm install`

Now you can edit the view and stylesheets for a custom appearance.

* Views `views/`
* Stylesheets `public/src/stylesheets/`

You'll then need to rebuild the stylesheets with `npm install` or `bin/make`.

To start the hotspot, run `npm start` or `bin/hotspot`

## Test
Run tests with
`npm test`
