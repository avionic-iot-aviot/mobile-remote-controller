# Remote Controller
Remote controller app (Android and iOS) for drones pilotage.


# Prerequisites

To be able to run this code you need to have installed:

- node 12.22 or higher (suggested to use nvm: https://github.com/nvm-sh/nvm)
- expo-cli (https://docs.expo.io/get-started/installation/)
- Android Studio (if you want to run the app in a virtual device)
- adb (if you want to test it on a device)

# Install

Run:

```bash
yarn
```

# How to run and test on an Android phone

If you have an Android phone you need to:

- Allow USB Debug from settings
- Allow to install apps via USB (it is not always needed)
- Plug your phone with a USB cable on your PC

If you don't have an Android phone or you want to use a virtual device:

- Create a device on Android Studio (AVD Manager)
- Set up the dev environment (https://reactnative.dev/docs/environment-setup)
- Open the virtual device through Android Studio (AVD Manager)

Now you have to open two shells and send these commands:

```bash
#Shell 1
yarn run start
```

```bash
#Shell 2
yarn run android
```

The first shell starts the local "server" and allows you to check the logs and reload the app on your device.

The second shell compile the Java code (generated from the javascript code) and runs a command to install an app on your device. You need to accept if prompted. Once completed the app will be running on your device.