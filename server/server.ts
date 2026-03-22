import "dotenv/config";
import express, { Request, Response } from 'express';
import cors from "cors";
import connectDB from "./config/db.js";
import { clerkMiddleware } from '@clerk/express'
import { clerkwebhook } from "./controllers/webhooks.js";
import makeAdmin from "./scripts/makeAdmin.js";
import productRouter from "./routes/productRoutes.js";
import CartRouter from "./routes/cartRoutes.js";
import OrderRoute from "./routes/orderRoutes.js";
import AddressRoute from "./routes/AddressRoute.js";
import AdminRoute from "./routes/AdminRoutes.js";

const app = express();

// DB connect (IMPORTANT: wrap in function)
let isConnected = false;
const connect = async () => {
    if (!isConnected) {
        await connectDB();
        isConnected = true;
    }
};
await connect();

// webhook route (raw body)
app.post('/api/clerk', express.raw({ type: "application/json" }), clerkwebhook);

// middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// test route
app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

// routes
app.use("/api/products", productRouter);
app.use("/api/cart", CartRouter);
app.use("/api/orders", OrderRoute);
app.use("/api/addresses", AddressRoute);
app.use("/api/admin", AdminRoute);

// run once
await makeAdmin();

// ✅ IMPORTANT: export default (NO listen)
export default app;