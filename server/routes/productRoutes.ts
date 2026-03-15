import express from "express";
import { createProduct, getProducts, getSingleProduct } from "../controllers/productController.js";
import upload from "../middleware/upload.js";
import { authorize, protect } from "../middleware/Auth.js";

const productRouter = express.Router();


// get all products

productRouter.get("/", getProducts);

// get single product


productRouter.get("/:id", getSingleProduct);



// create product
productRouter.post("/", upload.array("images", 5), protect, authorize("admin"), createProduct)

// update products


// delete products

