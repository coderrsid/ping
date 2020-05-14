import { useState, useEffect } from "react";
import axios from 'axios'
import { pushNotificationData } from './UserFunctions';
import {
  isPushNotificationSupported,
  askUserPermission,
  registerServiceWorker,
  createNotificationSubscription,
  getUserSubscription
} from "./push-notifications";
import jwt_decode from 'jwt-decode'

//import all the function created to manage the push notifications

const pushNotificationSupported = isPushNotificationSupported();
//first thing to do: check if the push notifications are supported by the browser

export default function usePushNotifications() {
  const [userConsent, setSuserConsent] = useState(Notification.permission);
  //to manage the user consent: Notification.permission is a JavaScript native function that return the current state of the permission
  //We initialize the userConsent with that value
  const [userSubscription, setUserSubscription] = useState(null);
  //to manage the use push notification subscription
  const [pushServerSubscriptionId, setPushServerSubscriptionId] = useState();
  //to manage the push server subscription
  const [error, setError] = useState(null);
  //to manage errors
  const [loading, setLoading] = useState(true);
  //to manage async actions

  useEffect(() => {
    if (pushNotificationSupported) {
      setLoading(true);
      setError(false);
      registerServiceWorker().then(() => {
        setLoading(false);
      });
    }
  }, []);
  //if the push notifications are supported, registers the service worker
  //this effect runs only the first render
  
  useEffect(() => {
    setLoading(true);
    setError(false);
    const getExixtingSubscription = async () => {
      const existingSubscription = await getUserSubscription();
      setUserSubscription(existingSubscription);
      setLoading(false);
    };
    getExixtingSubscription();
  }, []);
  //Retrieve if there is any push notification subscription for the registered service worker
  // this use effect runs only in the first render

  /**
   * define a click handler that asks the user permission,
   * it uses the setSuserConsent state, to set the consent of the user
   * If the user denies the consent, an error is created with the setError hook
   */
  const onClickAskUserPermission = () => {
    console.log('asked user permission');
    setLoading(true);
    setError(false);
    askUserPermission().then(consent => {
      setSuserConsent(consent);
      if (consent !== "granted") {
        alert('Please grant permission for remainders');
      } else {
        console.log('subscibed1');
        onClickSusbribeToPushNotification();
      }
      setLoading(false);
    });
  };
  //

  /**
   * define a click handler that creates a push notification subscription.
   * Once the subscription is created, it uses the setUserSubscription hook
   */
  const onClickSusbribeToPushNotification = () => {
    setLoading(true);
    setError(false);
    createNotificationSubscription()
      .then(function(subscription) {
        console.log(subscription);
        onClickSendSubscriptionToPushServer(subscription);
        setLoading(false);
      })
      .catch(err => {
        console.error("Couldn't create the notification subscription", err, "name:", err.name, "message:", err.message, "code:", err.code);
        setError(err);
        setLoading(false);
      });
  };

  /**
   * define a click handler that sends the push susbcribtion to the push server.
   * Once the subscription ics created on the server, it saves the id using the hook setPushServerSubscriptionId
   */
  const onClickSendSubscriptionToPushServer = (subscription) => {
    setLoading(true);
    setError(false);
    const token = localStorage.usertoken;
    const decoded = jwt_decode(token);
    console.log(subscription);
    setPushServerSubscriptionId(subscription);
    subscription = JSON.stringify(subscription);
    pushNotificationData(decoded.identity.id, subscription);
  };

  /**
   * define a click handler that requests the push server to send a notification, passing the id of the saved subscription
   */
  const onClickSendNotification = async () => {
    setLoading(true);
    setError(false);
    await axios.get(`/subscription/${pushServerSubscriptionId}`).catch(err => {
      setLoading(false);
      setError(err);
    });
    setLoading(false);
  };

  /**
   * returns all the stuff needed by a Component
   */
  return {
    onClickAskUserPermission,
    onClickSusbribeToPushNotification,
    onClickSendSubscriptionToPushServer,
    pushServerSubscriptionId,
    onClickSendNotification,
    userConsent,
    pushNotificationSupported,
    userSubscription,
    error,
    loading
  };
}