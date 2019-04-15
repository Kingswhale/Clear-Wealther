import firebase from 'react-native-firebase';
// Optional flow type
import type { RemoteMessage } from 'react-native-firebase';
import EventBus from "eventing-bus";

export default async (message: RemoteMessage) => {
    // handle your message
    EventBus.publish("pushNotification", message.data.message);
    return Promise.resolve();
}