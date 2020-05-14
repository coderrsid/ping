import jwt_decode from 'jwt-decode';
import { pushNotificationData } from './UserFunctions';

const pushServerPublicKey = "BFP1Dt3LZz9md5h8bZjAru8fY-ACbUFLpI4-Ln0lBrhMd694T_ujWSM6cxq_bu6SYMaV6pB3aRwprWdt_ufrqi0";

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  // eslint-disable-next-line
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
/**
 * checks if Push notification and service workers are supported by your browser
 */
function isPushNotificationSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

/**
 * asks user consent to receive push notifications and returns the response of the user, one of granted, default, denied
 */
async function askUserPermission() {
  return await Notification.requestPermission();
}
/**
 *
 */
function registerServiceWorker() {
  return navigator.serviceWorker.register('/sw.js');
}

/**
 *
 * using the registered service worker creates a push notification subscription and returns it
 *
 */
async function createNotificationSubscription() {
  //wait for service worker installation to be ready
  // subscribe and return the subscription
  const applicationServerKey = urlB64ToUint8Array(pushServerPublicKey)
  // console.log(applicationServerKey)
  return navigator.serviceWorker.ready.then(
    function(serviceWorkerRegistration) {
      var options = {
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      };
      serviceWorkerRegistration.pushManager.subscribe(options).then(
        function(pushSubscription) {
          const token = localStorage.usertoken;
          const decoded = jwt_decode(token);
          const subscription = JSON.stringify(pushSubscription);
          pushNotificationData(decoded.identity.id, subscription);
          // The push subscription details needed by the application
          // server are now available, and can be sent to it using,
          // for example, an XMLHttpRequest.
        }, function(error) {
          // During development it often helps to log errors to the
          // console. In a production environment it might make sense to
          // also report information about errors back to the
          // application server.
          console.log(error);
        }
      );
    });
}

/**
 * returns the subscription if present or nothing
 */
function getUserSubscription() {
  //wait for service worker installation to be ready, and then
  return navigator.serviceWorker.ready
    .then(function(serviceWorker) {
      return serviceWorker.pushManager.getSubscription();
    })
    .then(function(pushSubscription) {
      return pushSubscription;
    });
}

export {
  isPushNotificationSupported,
  askUserPermission,
  registerServiceWorker,
  createNotificationSubscription,
  getUserSubscription
};