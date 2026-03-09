import { dummyWishlist } from "@/assets/assets";
import { Product, WishlistContextType } from "@/constants/types";
import { createContext, useContext, useEffect, useState } from "react";


const WichListContext = createContext<WishlistContextType | undefined>(undefined);


export function WishListProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishList] = useState<Product[]>([])
    const [loading, setLoading] = useState(false);

    const fetchWishlist = async () => {
        setLoading(true);
        setWishList(dummyWishlist);
        setLoading(false);
    }

    const toggleWishlist = async (product: Product) => {
        setWishList((prev) => {
            const exits = prev.some((p) => p._id === product._id);
            if (exits) {
                return prev.filter((p) => p._id !== product._id)
            }

            return [...prev, product]
        })
    }

    const isInWishlist = (productId: string) => {
        return wishlist.some((p) => p._id === productId);

    }

    useEffect(() => {
        fetchWishlist()
    }, [])
    return (
        <WichListContext.Provider value={{ wishlist, loading, isInWishlist, toggleWishlist }}>
            {children}
        </WichListContext.Provider>
    )
}


export function useWishList() {
    const context = useContext(WichListContext);
    if (context === undefined) {
        throw new Error("useWishList must be used within a WishListProvider");
    }
    return context;
}