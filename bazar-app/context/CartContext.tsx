import { dummyCart } from "@/assets/assets";
import api from "@/constants/api";
import { Product } from "@/constants/types";
import { useAuth } from "@clerk/expo";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";



export type CartItem = {
    id: string,
    productId: string,
    product: Product,
    quantity: number,
    size: string,
    price: number
}


export type CartContextType = {
    cartItems: CartItem[],
    addToCart: (product: Product, size: string) => Promise<void>
    removeFromCart: (itemId: string, size: string) => void
    updateQuantity: (itemId: string, quantity: number, size: string) => Promise<void>
    clearCart: () => Promise<void>
    cartTotal: number
    itemCount: number
    isLoading: boolean
}



const CartContext = createContext<CartContextType | undefined>(undefined);


export function CartProvider({ children }: { children: React.ReactNode }) {

    const {getToken,isSignedIn} = useAuth()

    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [cartTotal, setCartTotal] = useState(0)

    const fetchCart = async () => {
        try {
            setIsLoading(true);
            const token = await getToken();
            const { data } = await api.get("/cart", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            if (data.success && data?.data) {
                const serverCart = data?.data;
                const mappedItems: CartItem[] = serverCart.items.map((item: any) => ({
                    id: item.product._id,
                    productId: item.product._id,
                    product: item.product,
                    quantity: item.quantity,
                    size: item?.size || "M",
                    price: item.price
                }))

                setCartItems(mappedItems);
                setCartTotal(serverCart.totalAmount)
            }
        } catch (error) {
            Alert.alert("Error", "Failed to fetch cart. Please try again later.");
        }
        finally {
            setIsLoading(false);
        }
    }

    const addToCart = async (product: Product, size: string) => {

        if (!isSignedIn) {
            return Toast.show({
                type: "error",
                text1: "Please sign in to add items to cart",
                text2: "You need to be signed into manage your cart and place orders"
            })
        }

        try {
            setIsLoading(true);
            const token = await getToken();
            const { data } = await api.post(`/cart/add`, {
                productId: product?._id,
                quantity: 1,
                size
            }, {
                headers: {
                    Authorization: `Bearer ${token}`, 
                }
            })

            if (data?.success) {
               await fetchCart()
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Failed to add item to cart",
                text2: "Please try again later."
            })
        } finally {
            setIsLoading(false)
        }
    }

    const removeFromCart = async (productId: string, size: string) => {

        if (!isSignedIn) return;

        try {
            setIsLoading(true);
            const token = await getToken();
            const { data } = await api.delete(`/cart/item/${productId}?size=${size}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })

            if (data.success) {
                await fetchCart()
            }

        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Failed to remove item from cart",
                text2: "Please try again later."
            })
        }
        finally {
            setIsLoading(false)
        }
    }


    const updateQuantity = async (productId: string, quantity: number, size: string = "M") => {

        if (!isSignedIn) return;
        if (quantity < 1) {
            return removeFromCart(productId, size);
        }

        try {
            setIsLoading(true);
            const token = await getToken();
            const { data } = await api.put(`/cart/item/${productId}`, {
                quantity,
                size
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })

            if (data.success) {
                await fetchCart()
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Failed to update item quantity",
                text2: "Please try again later."
            })
        }
        finally {
            setIsLoading(false);
        }
    }


    const clearCart = async () => {
        if (!isSignedIn) return;


        try {
            setIsLoading(true);
            const token = await getToken();
            const { data } = await api.delete(`/cart`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })

            if (data.success) {
                setCartItems([]);
                setCartTotal(0);
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Failed to clear cart",
                text2: "Please try again later."
            })
        }
        finally {
            setIsLoading(false);
        }
    }

    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    useEffect(() => {
        if (isSignedIn) {
            fetchCart()
        } else {
            setCartItems([])
            setCartTotal(0)
        }
    }, [isSignedIn])

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            itemCount,
            isLoading
        }}>
            {children}
        </CartContext.Provider>
    )
}


export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}