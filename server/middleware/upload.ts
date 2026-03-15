import multer from "multer";

// memory storage (cloudinary ke liye best)
const storage = multer.memoryStorage();

// file filter (sirf images allow hongi)
const fileFilter = (req: any, file: any, cb: any) => {

    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/webp"
    ) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }

};

// multer upload
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter
});

export default upload;