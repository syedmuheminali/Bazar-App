import express from "express";
import { protect } from "../middleware/Auth.js";
import { getCart, AddToCrat, ClearCartItems, RemoveCartItems, UpdateCartItems } from "../controllers/cartController.js";
const CartRouter = express.Router();
// get user cart
CartRouter.get("/", protect, getCart);
// add item cart
CartRouter.post("/add", protect, AddToCrat);
// update cart
CartRouter.put("/item/:productId", protect, UpdateCartItems);
// remove cart
CartRouter.delete("/item/:productId", protect, RemoveCartItems);
// clear cart
CartRouter.delete("/", protect, ClearCartItems);
export default CartRouter;
