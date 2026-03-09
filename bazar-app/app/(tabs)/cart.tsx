import CartItems from '@/components/CartItems';
import Header from '@/components/Header';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Cart() {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();

  const shipping = 2.00;
  const total = cartTotal + shipping
  return (
    <SafeAreaView className='flex-1 bg-surface' edges={["top"]}>
      <Header title='My Cart' showBack />

      {cartItems?.length > 0 ? (
        <>
          <ScrollView className='flex-1 px-4 mt-4' showsVerticalScrollIndicator={false}>
            {cartItems.map((item, index) => (
              <CartItems key={index} item={item} onRemove={() => removeFromCart(item.id, item.size)} onUpdateQuantity={(q) => updateQuantity(item.id, q, item.size)} />
            ))}
          </ScrollView>

          <View className='p-4 bg-white rounded-t-3xl shadow-sm'>
            {/* subtotal */}
            <View className='flex-row justify-between mb-2'>
              <Text className='text-secondary'>Subtotal</Text>
              <Text className='text-secondary font-bold'>Rs: {cartTotal.toFixed(2)}</Text>
            </View>

            {/* subshiping */}
            <View className='flex-row justify-between mb-2'>
              <Text className='text-secondary'>Shipping</Text>
              <Text className='text-secondary font-bold'>Rs: {shipping.toFixed(2)}</Text>
            </View>
            {/* border */}
            <View className='h-[1px] bg-border mb-4'/>
            {/* total */}
            <View className='flex-row justify-between mb-6'>
              <Text className='text-primary font-bold text-lg'>Total</Text>
              <Text className='text-secondary font-bold text-lg'>Rs: {total.toFixed(2)}</Text>
            </View>

            {/* checkout button */}
            <TouchableOpacity className='bg-primary rounded-full py-4 items-center' onPress={() => router.push('/checkout')}>
              <Text className='text-white font-bold text-base'>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      ) :
        <View className='flex-1 items-center justify-center'>
          <Text className='text-secondary '>Your Cart is Empty</Text>
          <TouchableOpacity onPress={() => router.push("/")} className='mt-4'>
            <Text className='text-primary font-bold'>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      }
    </SafeAreaView>
  )
}