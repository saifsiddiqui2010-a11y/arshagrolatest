const firebaseConfig = require('../firebase-applet-config.json');

module.exports = ({ config }) => ({
  ...config,
  plugins: [...(config.plugins || []), 'expo-web-browser', 'expo-notifications'],
  extra: {
    ...config.extra,
    eas: {
      ...config.extra?.eas,
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || config.extra?.eas?.projectId || '',
    },
    firebaseConfig,
    googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
    googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
    googleWebClientId: firebaseConfig.oAuthClientId || '',
  },
});
