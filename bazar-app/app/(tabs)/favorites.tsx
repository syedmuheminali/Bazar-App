import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { useWishList } from '@/context/WishlistContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Favorites() {
  const { wishlist } = useWishList();
  const router = useRouter();
  return (
    <SafeAreaView edges={["top"]} className='flex-1 bg-surface'>
      <Header title='Wishlist' showMenu showCart />

      {wishlist?.length > 0 ? (
        <ScrollView className='flex-1 px-4 mt-4' showsVerticalScrollIndicator={false} >
          <View className='flex-row flex-wrap justify-between'>
            {wishlist?.map((product) => (
              <ProductCard key={product?._id} product={product} />
            ))}
          </View>
        </ScrollView>
      ) : <View className='flex-1 items-center justify-center'>
        <Text className='text-secondary text-lg'>Your Wishlist is Empty</Text>
        <TouchableOpacity onPress={() => router.push("/")} className='mt-4'>
          <Text className='text-primary font-bold'>Start Shopping</Text>
        </TouchableOpacity>
      </View>
      }
    </SafeAreaView>
  )
}