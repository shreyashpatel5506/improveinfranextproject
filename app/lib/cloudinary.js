import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

/* ===============================
   Cloudinary Configuration
================================ */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ===============================
   Upload File (Image / Video)
   resource_type: "auto" supports both
================================ */
export const uploadToCloudinary = async (
    filePath,
    folder = "complaints"
) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: "auto", // image OR video
        });

        // remove file from server after upload
        fs.unlinkSync(filePath);

        return {
            url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
        };
    } catch (error) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
};

/* ===============================
   Delete File from Cloudinary
================================ */
export const deleteFromCloudinary = async (
    publicId,
    resourceType = "image"
) => {
    try {
        await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType, // image | video
        });
    } catch (error) {
        throw error;
    }
};

export default cloudinary;
