import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import api from '@/constants/api';

export async function registerForPushNotificationsAsync(
  clerkId: string
) {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } =
        await Notifications.requestPermissionsAsync();

      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Permission not granted!");
      return;
    }

    token =
      (await Notifications.getExpoPushTokenAsync()).data;

    console.log("EXPO PUSH TOKEN:", token);

    await api.post("/save-push-token", {
      clerkId,
      pushToken: token
    });

    
  
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(
      "default",
      {
        name: "default",
        importance:
          Notifications.AndroidImportance.MAX
      }
    );
  }

  return token;
}





















// import * as Device from 'expo-device';

// import * as Notifications from 'expo-notifications';

// import { Platform } from 'react-native';

// export async function registerForPushNotificationsAsync() {

//   let token;

//   if (Device.isDevice) {

//     const { status: existingStatus } =
//       await Notifications.getPermissionsAsync();

//     let finalStatus = existingStatus;

//     if (existingStatus !== 'granted') {

//       const { status } =
//         await Notifications.requestPermissionsAsync();

//       finalStatus = status;
//     }

//     if (finalStatus !== 'granted') {

//       alert('Permission not granted!');

//       return;
//     }

//     token =
//       (await Notifications.getExpoPushTokenAsync()).data;

//     console.log('EXPO PUSH TOKEN:', token);

//   } else {

//     alert('Must use physical device');

//   }

//   if (Platform.OS === 'android') {

//     await Notifications.setNotificationChannelAsync(
//       'default',
//       {
//         name: 'default',
//         importance:
//           Notifications.AndroidImportance.MAX,
//       }
//     );
//   }

//   return token;
// }