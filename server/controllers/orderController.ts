import { Request, Response } from "express";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import product from "../models/Products.js";



// GET user orders
// GET /api/orders


export const getOrders = async (req: Request, res: Response) => {
    try {
        const query = { user: req.user._id }
        const orders = await Order.find(query).populate("items.product", "name images").sort("-createdAt")

        res.json({
            success: true,
            data: orders
        })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
}


// GET single product

// GET /api/:order


export const getSingleOrder = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id).populate("items.product", "name images");

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not Found" })
        }

        if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not authorized" })
        }

        res.json({ success: true, data: order })

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
}



// Create order
//POST /api/order

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { shippingAddress, notes } = req.body;

        const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is Empty!" })
        }

        // verify stock and prepare order items

        const orderItems = [];

        for (const item of cart.items) {
            const Product = await product.findById(item.product._id);

            if (!Product || Product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${item.product as any}.name`
                })
            }

            orderItems.push({
                product: item.product._id,
                name: (item.product as any),
                quantity: item.quantity,
                price: item.price,
                size: item.size
            })
            // Reduce stock
            Product.stock -= item.quantity;
            await Product.save();
        }

        const subtotal = cart.totalAmount;
        const shippingCost = 2;
        const tax = 0;
        const totalAmount = subtotal + shippingCost + tax

        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod: req.body.paymentMethod || "cash",
            paymentStatus: "pending",
            subtotal,
            shippingCost,
            tax,
            totalAmount,
            notes,
            paymentIntentId: req.body.paymentIntentId,
            orderNumber: "ORD-" + Date.now()
        })

        if(req.body.paymentMethod !== "stripe"){
            cart.items = []
            cart.totalAmount = 0;
            await cart.save()
        }

        res.status(201).json({ success: true, message: "Order Successfully Created", data: order })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
}


