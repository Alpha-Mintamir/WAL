importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js"
);

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  projectId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  storageBucket: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  messagingSenderId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  appId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  measurementId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

const channel = new BroadcastChannel('firebase-messaging-channel');

messaging.onBackgroundMessage((payload) => {

  // Send the payload to the React app
  channel.postMessage(payload);

  let notificationTitle, notificationOptions;

  if (payload.notification) {
    // Handle the second type of response (with notification object)
    notificationTitle = payload.notification.title;
    notificationOptions = {
      body: payload.notification.body,
      icon: payload.notification.image || "/default-icon.png", // Provide a default icon if not present
    };
  } else if (payload.data) {
    // Handle the first type of response (with data object)
    notificationTitle = payload.data.title;
    notificationOptions = {
      body: payload.data.body,
      icon: payload.data.image || "/default-icon.png", // Provide a default icon if not present
      data: {
        click_action: payload.data.click_action,
        type: payload.data.type,
        type_id: payload.data.type_id,
      },
    };
  }

  // Customize notification here
  // const notificationTitle = "Background Message Title";
  // const notificationOptions = {
  //   body: "Background Message body.",
  //   icon: "/firebase-logo.png",
  // };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
