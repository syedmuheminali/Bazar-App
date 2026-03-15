import { Request, Response } from "express";
import product from "../models/Products.js";
import cloudinary from "../config/cloudinary.js";


// Get all products

export const getProducts = async (req: Request, res: Response) => {
    try {

        const { page = 1, limit = 10 } = req.query;

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        const query: any = { isActive: true };

        const total = await product.countDocuments(query);

        const products = await product
            .find(query)
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        res.json({
            success: true,
            data: products,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                pages: Math.ceil(total / limitNumber)
            }
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// get single product
//get /api/products/:id


export const getSingleProduct = async (req: Request, res: Response) => {
    try {

        const Product = await product.findById(req.params.id);

        if (!Product) {
            return res.status(404).json({ success: false, message: "Product not Found!" })
        }
        return res.status(200).json({
            success: true,
            data: Product
        });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
}


// create product


export const createProduct = async (req: Request, res: Response) => {
    try {
        let images = [];

        // handle fileUpload
        if (req.files && (req.files as any).length > 0) {
            const uploadPromises = (req.files as any).map((file: any) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream({ folder: 'bazar/products' }, (error, result) => {
                        if (error) reject(error)
                        else resolve(result!.secure_url)
                    })
                    uploadStream.end(file.buffer)
                })
            })
            images = await Promise.all(uploadPromises)
        }

        let sizes = req.body.sizes || [];
        if (typeof sizes === "string") {
            try {
                sizes = JSON.parse(sizes);
            } catch (error) {
                sizes = sizes.split(",").map((s: string) => s.trim()).filter((s: string) => s !== "");
            }
        }

        //Ensure they are arrays
        if (!Array.isArray(sizes)) sizes = [sizes];

        const productData = {
            ...req.body,
            images: images,
            sizes
        }

        if (images.length === 0) {
            return res.status(400).json({ success: false, message: "Please upload at least one image" })
        }

        const Product = await product.create(productData);
        return res.status(201).json({ success: true, data: product })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
}


/// update product
//PUT /api/product/:id



export const updateProduct = async (req: Request, res: Response) => {
    try {

        const { id } = req.params;

        const existingProduct = await product.findById(id);

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        let images: string[] = existingProduct.images || [];

        // Upload new images if provided
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {

            const uploadPromises = req.files.map((file: any) => {

                return new Promise<string>((resolve, reject) => {

                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: "bazar/products" },
                        (error, result) => {

                            if (error) return reject(error);

                            if (result?.secure_url) {
                                resolve(result.secure_url);
                            } else {
                                reject("Image upload failed");
                            }

                        }
                    );

                    uploadStream.end(file.buffer);

                });

            });

            const uploadedImages = await Promise.all(uploadPromises);

            // Merge old + new images
            images = [...images, ...uploadedImages];

        }

        // Handle sizes
        let sizes = req.body.sizes || existingProduct.sizes;

        if (typeof sizes === "string") {

            try {
                sizes = JSON.parse(sizes);
            } catch {

                sizes = sizes
                    .split(",")
                    .map((s: string) => s.trim())
                    .filter((s: string) => s !== "");
            }
        }

        if (!Array.isArray(sizes)) {
            sizes = [sizes];
        }

        const updatedProduct = await product.findByIdAndUpdate(
            id,
            {
                ...req.body,
                images,
                sizes
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            data: updatedProduct
        });

    } catch (error: any) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// delete product

export const deleteProduct = async (req: Request, res: Response) => {
    try {

        const { id } = req.params;

        const Product = await product.findById(id);

        if (!Product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Delete images from cloudinary
        if (Product.images && Product.images.length > 0) {

            for (const imageUrl of Product.images) {

                const parts = imageUrl.split("/");
                const fileName = parts[parts.length - 1];
                const publicId = `bazar/products/${fileName.split(".")[0]}`;

                await cloudinary.uploader.destroy(publicId);
            }
        }

        await product.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Product and images deleted successfully"
        });

    } catch (error: any) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};