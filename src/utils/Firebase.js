'use client'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'
import firebase from "firebase/compat/app"
import { getAuth } from "firebase/auth";
import { useDispatch } from 'react-redux';
import { setFcmTokenData } from '@/redux/reducers/settingSlice';


const FirebaseData = () => {

  const dispatch = useDispatch()

  let firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGEING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MESUMENT_ID
  }


  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const authentication = getAuth();



  const firebaseApp = !getApps().length
    ? initializeApp(firebaseConfig)
    : getApp();

  const messagingInstance = async () => {
    try {
      const isSupportedBrowser = await isSupported();
      if (isSupportedBrowser) {
        return getMessaging(firebaseApp);
      }
    } catch (err) {
      console.error('Error checking messaging support:', err);
      return null;
    }
  };
  const fetchToken = async (setTokenFound, setFcmToken) => {
    const messaging = await messagingInstance();
    if (!messaging) {
      console.error('Messaging not supported.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        })
          .then((currentToken) => {
            if (currentToken) {
              setTokenFound(true);
              setFcmToken(currentToken);
              setFcmTokenData(currentToken);
            } else {
              setTokenFound(false);
              setFcmToken(null);
              // toast.error('Permission is required to receive notifications.');
            }
          })
          .catch((err) => {
            console.error('Error retrieving token:', err);
            // If the error is "no active Service Worker", try to register the service worker again
            if (err.message.includes('no active Service Worker')) {
              registerServiceWorker(setTokenFound, setFcmToken);
            }
          });
      }
      if (permission === 'denied') {
        console.log('notification permission denied')
      }
      else {
        setTokenFound(false);
        setFcmToken(null);
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  };

  const registerServiceWorker = (setTokenFound, setFcmToken) => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registration successful with scope: ', registration.scope);
          // After successful registration, try to fetch the token again
          fetchToken(setTokenFound, setFcmToken);
        })
        .catch((err) => {
          console.log('Service Worker registration failed: ', err);
        });
    }
  };

  const onMessageListener = async () => {
    const messaging = await messagingInstance();
    if (messaging) {
      return new Promise((resolve) => {
        onMessage(messaging, (payload) => {
          resolve(payload);
        });
      });
    } else {
      console.error('Messaging not supported.');
      return null;
    }
  };
  const signOut = () => {
    return authentication.signOut();
  };
  return { authentication, fetchToken, onMessageListener, signOut }
}

export default FirebaseData;
