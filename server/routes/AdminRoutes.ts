import express from "express";
import { protect,authorize } from "../middleware/Auth.js";
import { getDasboardStats } from "../controllers/adminControll.js";

const AdminRoute = express.Router();


AdminRoute.get("/stats",protect,authorize("admin"),getDasboardStats)

export default AdminRoute;