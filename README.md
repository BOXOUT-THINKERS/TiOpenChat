# TiOpenChat
- Titanium open source chat mobile app for iOS/Android using BaaS by BOXOUT THINKERS

# Open, welcome.
- Welcome all suggestions and function.
If you have any questions, please use github issue.

# Development Environment
- App : Titanium Mobile Platform
- MBaaS : Parse.com + Firebase.com
- SMS Verification : Twillio.com

# Code Review
- https://goo.gl/EWa1oG

# How to Run
1. Parse.com & Firebase.com & Twillio.com subscribe to trial plan, prepare and select the api key.
2. Fill the empty api key into tiapp.xml.
3. Fill the twillio api key into Cloude_Code/cloud/main.js and deploy to parse (For testing, Phone number ending in 0000 is fixed to the authorized number 0000.)
4. Create Parse Class for Titanium models (app/controllers/models)
5. Build a development environment available in Titanium.

# TODO
- Run & Messaging Correctly, but The code requires the cleanup of having to remove it from the product.

# Modules used
- Android
  1. https://github.com/gimdongwoo/Parse
  2. https://github.com/gimdongwoo/ti-firebase
  3. https://github.com/manumaticx/Ti.DrawerLayout
  4. https://github.com/gimdongwoo/ti.imagefactory
  5. https://github.com/freshheads/fh.imagefactory
  6. https://github.com/gimdongwoo/Ti-Android-CameraView

- iOS
  1. https://github.com/gimdongwoo/firebase-titanium
  2. https://github.com/yomybaby/kr.yostudio.drawer
  3. https://github.com/gimdongwoo/ti.imagefactory
  
- CommonJS
  1. https://github.com/nitrag/TiParseJS

- Widget
  1. https://github.com/yomybaby/kr.yostudio.drawer
  2. https://github.com/danielhanold/danielhanold.pickerwidget
  3. https://github.com/FokkeZB/nl.fokkezb.loading
  4. https://github.com/FokkeZB/nl.fokkezb.toast

# License
- Apache 2 License
- http://www.apache.org/licenses/LICENSE-2.0
