# mobile-remote-controller
Remote controller app (Android and iOS) for drones pilotage.


# Install

You need to follow the following steps:
- Install openjdk 1.11.0 (consider to use <a href="https://github.com/shyiko/jabba">jabba</a>)
- Install node 12 or higher (consider to use <a href="https://github.com/nvm-sh/nvm">nvm</a>)
- Run "npm install" in main folder
- Run "npm install -g expo-cli"
- Install "adb"
- (OPTIONAL) Install Android Studio. Then create a device with OS Android 10 and start it once.

# How to run

If you want to use a real device, plug it and enable "USB debugging". You have to open two shells. Run these commands one in each shell:
- npm run start
- npm run android

"npm run start" needs to run the server used to stream the app to the testing device (needed only for developing purposes).
"npm run android" installs the apk/ipa on your device.
