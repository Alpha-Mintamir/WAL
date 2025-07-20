'use client'
import React, { useEffect, useState } from 'react'
import 'firebase/messaging'
import { useSelector } from 'react-redux'
import FirebaseData from '../../utils/Firebase'
import toast from 'react-hot-toast'

const PushNotificationLayout = ({ children,onNotificationReceived = () => {} }) => {
  const [notification, setNotification] = useState(null)
  const [userToken, setUserToken] = useState(null)
  const [isTokenFound, setTokenFound] = useState(false)
  const [fcmToken, setFcmToken] = useState('')
  const { fetchToken, onMessageListener } = FirebaseData()

  const getfcmToken = useSelector((state) => state?.settingsData)

  useEffect(() => {
    handleFetchToken()
  }, [])

  const handleFetchToken = async () => {
    await fetchToken(setTokenFound, setFcmToken)
    
  }

  useEffect(() => {
    if (typeof window !== undefined) {
      setUserToken(getfcmToken?.fcmToken)
    }
  }, [userToken])

  useEffect(() => {
    onMessageListener()
      .then((payload) => {
        if (payload && payload.data) {
          setNotification(payload.data);
          onNotificationReceived(payload.data);
        }
      })
      .catch((err) => {
        console.log(err)
        console.error('Error handling foreground notification:', err);
        toast.error('Error handling notification.');
      });
  }, [notification]);

  // / service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/firebase-messaging-sw.js').then(
          function (registration) {
            console.log('Service Worker registration successful with scope: ', registration.scope)
          },
          function (err) {
            console.log('Service Worker registration failed: ', err)
          }
        )
      })
    }
  }, [notification])
  return <div>{React.cloneElement(children)}</div>;
}

export default PushNotificationLayout
