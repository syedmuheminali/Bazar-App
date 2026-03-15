import express from "express";
import { getProducts, getSingleProduct } from "../controllers/productController.js";

const productRouter = express.Router();


// get all products

productRouter.get("/", getProducts);

// get single product


productRouter.get("/:id", getSingleProduct);



// create product


// update products


// delete products

