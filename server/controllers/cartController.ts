
import { Request, Response } from "express"
import Cart from "../models/Cart.js"
import product from "../models/Products.js";


// Get user cart

export const getCart = async (req: Request, res: Response) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate("items.product", "name images price stock");

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] })
        }

        res.json({ success: true, data: cart })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
}


// Get /api/cart
export const AddToCrat = async (req: Request, res: Response) => {
    try {
        const { productId, quantity = 1, size } = req.body;

        let Product = await product.findById(productId);

        if (!Product) {
            return res.status(404).json({ success: false, message: "Product not Found" })
        }

        if (Product.stock < quantity) {
            return res.status(400).json({ success: false, message: "Insufficient stock" })
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] })
        }

        // find item with same product and size

        const exitingItem = cart.items.find((item) => {
            return item.product.toString() === productId && item.size === size
        })

        if (exitingItem) {
            exitingItem.quantity += quantity;
            exitingItem.price += Product.price;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                price: Product.price,
                size
            })
        }

        cart.calculateTotal();
        await cart.save();

        await cart.populate("items.product", "name images price stock");

        res.status(200).json({ success: true, data: cart })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
}


// update Cart item quantity
// PUT /api/cart/item/:productId

export const UpdateCartItems = async (req: Request, res: Response) => {
    try {
        const { quantity, size } = req.body;
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user._id })

        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not Found" })
        }
        const item = cart.items.find((item) => item.product.toString() === productId && item.size === size)


        if (!item) {
            return res.status(404).json({ success: false, message: "Item Not in Cart" })
        }

        if (quantity <= 0) {
            cart.items = cart.items.filter((item) => { item.product.toString() !== productId })
        } else {
            const Product = await product.findById(productId);
            if (Product!.stock < quantity) {
                return res.status(404).json({ success: false, message: "Insufficient Stock" })
            }
            item.quantity = quantity
        }
        cart.calculateTotal();
        await cart.save();
        await cart.populate("items.product", "name images price stock");
        res.status(200).json({ success: true, data: cart })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
}


// Remove Cart item quantity
// DELETE /api/cart/item/:productId


export const RemoveCartItems = async (req: Request, res: Response) => {
    try {
        const { size } = req.body;
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart || !size) {
            return res.status(404).json({ success: false, message: "Cart Not Found" })
        }

        cart.items = cart.items.filter((item) => { item.product.toString() !== req.params.productId || item.size !== size })
        cart.calculateTotal();
        await cart.save();
        await cart.populate("items.product", "name images price stock");

        res.status(200).json({ success: true, data: cart })

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
}



// Clear Cart item quantity
// DELETE /api/cart/item/:productId


export const ClearCartItems = async (req: Request, res: Response) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (cart) {
            cart.items = [];
            cart.totalAmount = 0
            await cart.save()
        }

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
}
