import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: 'ddr44xb7k',
    api_key: '459712134235642',
    api_secret: '5MfaPrQ_HCeEQulenmr5YdL6tm4'
});

export const uploadToCloudinary = async (file,type) => {
    try {
        const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const uploadResponse = await cloudinary.uploader.upload(fileStr, {
            folder: type==="user" ?"user-images":'product-images',
            resource_type: 'auto',
        });
        
        return {
            url: uploadResponse.secure_url,
            publicId: uploadResponse.public_id
        };
    } catch (error) {
        // Throw the error instead of returning a NextResponse
        console.error("Cloudinary upload error:", error);
        throw new Error("Error uploading to Cloudinary: " + error.message);
    }
};

export const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return;
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        throw new Error("Error deleting from Cloudinary: " + error.message);
    }
};