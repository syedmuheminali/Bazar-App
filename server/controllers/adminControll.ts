import { Request, Response } from "express";
import User from "../models/User.js";
import product from "../models/Products.js";
import Order from "../models/Order.js";

//Get Dashboard stats
//GET /api/admin/stats
export const getDasboardStats = async (req: Request, res: Response) => {
    try {

        const totalUser = await User.countDocuments()
        const totalProduct = await product.countDocuments()
        const totalOrders = await Order.countDocuments()

        const validOrders = await Order.find({ orderStatus: { $ne: "cancelled" } });
        const totalRevenue = await validOrders.reduce((sum, order) => sum + order.totalAmount, 0)

        const recentOrders = await Order.find().sort("-createdAt").limit(5).populate("user", "name email")


        res.status(200).json({ success: true, data: totalUser, totalProduct, totalOrders, totalRevenue, recentOrders })

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
}