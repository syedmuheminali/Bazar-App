import express from "express";
import { authorize, protect } from "../middleware/Auth";
import { getOrders, createOrder, getAllOrders, getSingleOrder, updateOrderStatus } from "../controllers/orderController.js";


const OrderRoute = express.Router();

// Get user oders
OrderRoute.get("/", protect, getOrders);


// Get single order
OrderRoute.get("/:id", protect, getSingleOrder);

// create order from cart

OrderRoute.post("/", protect, createOrder)

// update order status admin only

OrderRoute.put("/:id/status", protect, authorize("admin"), updateOrderStatus)

// get all orders admin only


OrderRoute.get("/admin/all", protect,authorize("admin"), getAllOrders)


export default OrderRoute