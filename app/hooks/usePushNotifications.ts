import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../context/auth-context';
import { api } from '../lib/api-client';

/**
 * Hook to handle Expo Push Notifications.
 * Using lazy-loading for 'expo-notifications' to prevent crashes in Expo Go (SDK 53+).
 */
export default function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<any>();
  const notificationListener = useRef<any>(undefined);
  const responseListener = useRef<any>(undefined);
  const { userToken } = useAuth();

  useEffect(() => {
    // Only register if user is logged in
    if (!userToken) return;

    // Detect Expo Go - SDK 53+ removed remote notification support from Expo Go Android
    const isExpoGo = Constants.appOwnership === 'expo';
    if (isExpoGo && Platform.OS === 'android') {
      console.warn('[PushNotifications] Remote notifications are not supported in Expo Go for Android (SDK 53+). Skipping registration.');
      return;
    }

    // Lazy load the module to avoid top-level library initialization check
    let Notifications: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      Notifications = require('expo-notifications');
    } catch (e) {
      console.warn('[PushNotifications] expo-notifications module not found or failed to load:', e);
      return;
    }

    if (!Notifications) return;

    // Set up notification handler inside the effect
    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    } catch (e) {
      console.error('[PushNotifications] Failed to set notification handler:', e);
    }

    registerForPushNotificationsAsync(Notifications).then(token => {
      if (token) {
        setExpoPushToken(token);
        // Register token with backend
        api.patch('/api/v1/notification/token', { token }).catch(err => {
          console.error('[PushNotifications] Failed to register token with backend:', err);
        });
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener((notif: any) => {
      setNotification(notif);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
      console.log('[PushNotifications] Notification response:', response);
      const orderId = response.notification.request.content.data?.orderId;
      if (orderId) {
        // Handle navigation if needed
      }
    });

    return () => {
      try {
        notificationListener.current?.remove();
      } catch (e) {
        console.debug('[PushNotifications] Cleanup error: notificationListener', e);
      }
      try {
        responseListener.current?.remove();
      } catch (e) {
        console.debug('[PushNotifications] Cleanup error: responseListener', e);
      }
    };
  }, [userToken]);

  return { expoPushToken, notification };
}

async function registerForPushNotificationsAsync(Notifications: any) {
  let token;

  console.log('[PushNotifications] Starting registration...');

  if (Platform.OS === 'android') {
    console.log('[PushNotifications] Setting up Android channel...');
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    console.log('[PushNotifications] Device detected. Checking permissions...');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    console.log('[PushNotifications] Existing permission status:', existingStatus);

    if (existingStatus !== 'granted') {
      console.log('[PushNotifications] Requesting permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    console.log('[PushNotifications] Final permission status:', finalStatus);

    if (finalStatus !== 'granted') {
      console.warn('[PushNotifications] Failed to get push token: permission not granted');
      return;
    }

    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

      if (!projectId) {
        console.warn('[PushNotifications] Project ID missing. Please link your project using "eas project:init"');
        return;
      }

      console.log('[PushNotifications] Using Project ID:', projectId);

      token = (await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      })).data;
      console.log('[PushNotifications] Received Token:', token);
    } catch (e: any) {
      console.error('[PushNotifications] Error fetching Expo Push Token:', e.message || e);
    }
  } else {
    console.warn('[PushNotifications] Must use physical device for Push Notifications. Simulators will not receive tokens.');
  }

  return token;
}
