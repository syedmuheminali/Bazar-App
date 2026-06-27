import express from "express";
import { protect,authorize } from "../middleware/Auth.js";
import { getDasboardStats } from "../controllers/adminControll.js";
import { savePushToken } from "../controllers/SavePushToken.js";

const router = express.Router();
const AdminRoute = express.Router();


AdminRoute.get("/stats",protect,authorize("admin"),getDasboardStats)
router.post("/save-push-token", savePushToken);


export default AdminRoute;