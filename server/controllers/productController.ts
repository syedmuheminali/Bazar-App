import { Request, Response } from "express";
import product from "../models/Products.js";


// Get all products

export const getProducts = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const query: any = { isActive: true }

        const total = await product.countDocuments(query);
        const products = await product.find(query).skip((Number(page) - 1) * Number(limit)).limit(Number(limit));

        res.json({
            success: true,
            data: products,
            pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
        })

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
}


// get single product
//get /api/products/:id


export const getProduct = async (req: Request, res: Response) => {
    try {

        const Product = await product.findById(req.params.id);

        if (!Product) {
            return res.status(404).json({ success: false, message: "Product not Found!" })
        }
        res.json({ success: true, data: Product })

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
}


// create product


export const createProduct = async (req: Request, res: Response) => {
    try {

        let images = [];

        // handle fileUpload
        
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
}