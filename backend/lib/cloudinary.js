import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with your cloud name, API key, and API secret
// This allows us to use environment variables in our code
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});// Configure Cloudinary with your cloud name, API key, and API secret

export default cloudinary;// Export the configured Cloudinary instance for use in other parts of the application
// This allows us to use the Cloudinary instance to upload images and perform other operations