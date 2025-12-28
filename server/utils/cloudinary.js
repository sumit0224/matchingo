const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload Function
const uploadImage = async (filePathOrUrl) => {
    try {
        if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'placeholder') {
            // Fallback
            return { secure_url: filePathOrUrl };
        }

        try {
            const result = await cloudinary.uploader.upload(filePathOrUrl, {
                folder: 'matchingo_users',
                use_filename: true,
                unique_filename: true,
            });
            return result;
        } catch (uploadError) {
            console.warn('Cloudinary Upload Failed, using raw URL:', uploadError.message);
            return { secure_url: filePathOrUrl };
        }
    } catch (error) {
        // Final safety net
        return { secure_url: filePathOrUrl };
    }
};

module.exports = { uploadImage };
