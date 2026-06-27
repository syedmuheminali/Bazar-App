import React, { useEffect } from 'react';
import "@/global.css";
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { ClerkProvider, useUser } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { CartProvider } from "@/context/CartContext";
import { WishListProvider } from "@/context/WishlistContext";
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from "@/notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

// Sirf useUser yahan shift kiya hai
function AppLayout() {
  const { user } = useUser();

  useEffect(() => {
    if (user?.id) {
      registerForPushNotificationsAsync(user.id);
    }
  }, [user]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CartProvider>
        <WishListProvider>

          <Stack screenOptions={{ headerShown: false }} />
          <Toast />

        </WishListProvider>
      </CartProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      <AppLayout />
    </ClerkProvider>
  );
}























// import React, { useEffect } from 'react';
// import "@/global.css";
// import { Stack } from 'expo-router';
// import 'react-native-reanimated';
// import { ClerkProvider, useUser } from '@clerk/expo'
// import { tokenCache } from '@clerk/expo/token-cache'
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import Toast from "react-native-toast-message";
// import { CartProvider } from "@/context/CartContext";
// import { WishListProvider } from "@/context/WishlistContext";
// import * as Notifications from 'expo-notifications';
// import {registerForPushNotificationsAsync} from "@/notifications";

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowBanner: true,
//     shouldShowList: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

// const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

// if (!publishableKey) {
//   throw new Error('Add your Clerk Publishable Key to the .env file')
// }

// export default function RootLayout() {

//   const { user } = useUser();

//   useEffect(() => {
//   if (user?.id) {
//     registerForPushNotificationsAsync(user.id);
//   }
// }, [user]);

//   return (
//     <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
//       <GestureHandlerRootView style={{ flex: 1 }}>
//         <CartProvider>
//           <WishListProvider>
            
//             <Stack screenOptions={{ headerShown: false }} />
//             <Toast />

//           </WishListProvider>
//         </CartProvider>
//       </GestureHandlerRootView>
//     </ClerkProvider>
//   );
// }
