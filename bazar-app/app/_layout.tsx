import "@/global.css";
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { ClerkProvider } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { CartProvider } from "@/context/CartContext";
import { WishListProvider } from "@/context/WishlistContext";


const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

export default function RootLayout() {

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <CartProvider>
          <WishListProvider>
            
            <Stack screenOptions={{ headerShown: false }} />
            <Toast />

          </WishListProvider>
        </CartProvider>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}
