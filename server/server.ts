import dotenv from "dotenv";
dotenv.config();
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
import morgan from "morgan";

const app = express();


// Middleware        
app.use(morgan("dev"));
app.use(cors())
app.use(express.json());
app.use(clerkMiddleware());
app.post('/api/clerk', express.raw({ type: "application/json" }), clerkwebhook)


app.get('/', (req: Request, res: Response) => {
    res.json({message:"Api Live ✅ "});
});

app.use("/api/products", productRouter);
app.use("/api/cart", CartRouter);
app.use("/api/orders", OrderRoute);
app.use("/api/addresses", AddressRoute);
app.use("/api/admin", AdminRoute);


// Start server only after MongoDB connected
const port = process.env.PORT || 3000;

console.log("CLOUD NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API KEY:", process.env.CLOUDINARY_API_KEY);
console.log("API SECRET:", process.env.CLOUDINARY_API_SECRET ? "EXISTS" : "MISSING");

const startServer = async () => {
  await connectDB();  // await MongoDB connection
  await makeAdmin();  // create admin after DB connected

  // app.listen(port, () => {
  //   console.log(`🚀 Server is running at http://localhost:${port}`);
  // });
};

// server live https://bazar-app-dusky.vercel.app/

startServer();


export default app;