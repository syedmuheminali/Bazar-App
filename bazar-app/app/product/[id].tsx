import { COLORS } from '@/constants';
import api from '@/constants/api';
import { Product } from '@/constants/types';
import { useCart } from '@/context/CartContext';
import { useWishList } from '@/context/WishlistContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function ProductDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    const { width, height } = Dimensions.get("window");
    const insets = useSafeAreaInsets(); // 🔥 SAFE AREA

    // 🔥 Responsive values
    const IMAGE_HEIGHT = height * 0.55;
    const ICON_SIZE = width * 0.06;
    const FONT_LARGE = width * 0.055;
    const FONT_MEDIUM = width * 0.04;
    const FONT_SMALL = width * 0.032;

    // 🔥 Footer height (FINAL FIX)
    const FOOTER_HEIGHT = 70 + insets.bottom;

    const { addToCart, itemCount } = useCart();
    const { toggleWishlist, isInWishlist } = useWishList();

    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const fetchProduct = async () => {
        try {
            const { data } = await api.get(`/products/${id}`);
            if (data.success) {
                setProduct(data?.data);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to fetch product details. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <SafeAreaView className='flex-1 items-center justify-center'>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    if (!product) {
        return (
            <SafeAreaView className='flex-1 items-center justify-center'>
                <Text>Product Not Found!</Text>
            </SafeAreaView>
        );
    }

    const isLiked = isInWishlist(product?._id);

    const handleAddToCart = () => {
        if (!selectedSize) {
            Toast.show({
                type: "error",
                text1: "No Size Selected",
                text2: "Please Select a Size"
            });
            return;
        }
        addToCart(product, selectedSize);
    };

    return (
        <View className='flex-1 bg-white'>

            {/* ✅ Scroll content */}
            <ScrollView
                contentContainerStyle={{
                    paddingBottom: FOOTER_HEIGHT + 20 // 🔥 FIX
                }}
            >

                {/* IMAGE CAROUSEL */}
                <View style={{ height: IMAGE_HEIGHT }} className='relative bg-gray-100 mb-6'>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        scrollEventThrottle={16}
                        onScroll={(e) => {
                            const slide = Math.ceil(
                                e.nativeEvent.contentOffset.x /
                                e.nativeEvent.layoutMeasurement.width
                            );
                            setActiveImageIndex(slide);
                        }}
                    >
                        {product.images?.map((image, index) => (
                            <Image
                                key={index}
                                source={{ uri: image }}
                                style={{ width: width, height: IMAGE_HEIGHT }}
                                resizeMode='cover'
                            />
                        ))}
                    </ScrollView>

                    {/* HEADER */}
                    <View className='absolute top-12 left-4 right-4 flex-row justify-between items-center z-10'>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={{ width: 40, height: 40 }}
                            className='bg-white/80 rounded-full items-center justify-center'
                        >
                            <Ionicons name='arrow-back' size={ICON_SIZE} color={COLORS.primary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => toggleWishlist(product)}
                            style={{ width: 40, height: 40 }}
                            className='bg-white/80 rounded-full items-center justify-center'
                        >
                            <Ionicons
                                name={isLiked ? "heart" : "heart-outline"}
                                size={ICON_SIZE}
                                color={isLiked ? COLORS.accent : COLORS.primary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* DOTS */}
                    <View className='absolute bottom-4 left-0 right-0 flex-row items-center justify-center gap-2'>
                        {product.images?.map((_, index) => (
                            <View
                                key={index}
                                style={{
                                    width: index === activeImageIndex ? 20 : 8,
                                    height: 8,
                                }}
                                className={`${index === activeImageIndex ? 'bg-primary' : 'bg-gray-300'} rounded-full`}
                            />
                        ))}
                    </View>
                </View>

                {/* PRODUCT INFO */}
                <View className='px-5'>

                    <View className='flex-row justify-between items-start mb-2'>
                        <Text style={{ fontSize: FONT_LARGE }} className='font-bold text-primary flex-1 mr-4'>
                            {product?.name}
                        </Text>

                        <View className='flex-row items-center'>
                            <Ionicons name='star' size={14} color="#FFD700" />
                            <Text style={{ fontSize: FONT_SMALL }} className='font-bold ml-1'>4.7</Text>
                            <Text style={{ fontSize: FONT_SMALL }} className='text-secondary ml-1'>(85)</Text>
                        </View>
                    </View>

                    <Text style={{ fontSize: FONT_LARGE }} className='font-bold text-primary mb-6'>
                        Rs: {product?.price.toFixed(2)}
                    </Text>

                    {/* SIZE */}
                   {product?.sizes?.length > 0 && (
    <>
        <Text style={{ fontSize: FONT_MEDIUM }} className='font-bold text-primary mb-3'>
            Size
        </Text>

        <View className='flex-row gap-3 mb-6 flex-wrap'>
            {product.sizes.map((size) => (
                <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    // Fixed width/height hata kar padding di hai takay box text ke hisaab se set ho
                    className={`px-5 py-2 rounded-lg items-center justify-center border ${
                        selectedSize === size
                            ? "bg-primary border-primary"
                            : "bg-white border-gray-200"
                    }`}
                >
                    <Text 
                        style={{ fontSize: FONT_SMALL }}
                        className={selectedSize === size ? "text-white" : "text-primary"}
                    >
                        {size}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    </>
)}

                    <Text style={{ fontSize: FONT_MEDIUM }} className='font-bold text-primary mb-2'>
                        Description
                    </Text>

                    <Text style={{ fontSize: FONT_SMALL }} className='text-secondary leading-6 mb-6'>
                        {product?.description}
                    </Text>
                </View>
            </ScrollView>

            {/* ✅ FIXED FOOTER */}
            <View
                style={{
                    height: FOOTER_HEIGHT,
                    paddingBottom: insets.bottom, // 🔥 MAIN FIX
                }}
                className='absolute bottom-0 left-0 right-0 flex-row px-4 pt-3 bg-white border-t border-gray-100'
            >
                <TouchableOpacity
                    onPress={handleAddToCart}
                    className='bg-primary rounded-full items-center flex-row justify-center'
                    style={{
                        width: '80%',
                        height: 50
                    }}
                >
                    <Ionicons name="bag-outline" size={20} color="white" />
                    <Text style={{ fontSize: FONT_MEDIUM }} className='text-white font-bold ml-2'>
                        Add to Cart
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push("/(tabs)/cart")}
                    className='flex-row justify-center items-center relative'
                    style={{
                        width: '20%',
                        height: 50
                    }}
                >
                    <Ionicons name="cart-outline" size={ICON_SIZE} />

                    <View className='absolute top-1 right-3 bg-black rounded-full justify-center items-center'
                        style={{ width: 16, height: 16 }}
                    >
                        <Text className='text-white text-[9px]'>{itemCount}</Text>
                    </View>
                </TouchableOpacity>
            </View>

        </View>
    );
}