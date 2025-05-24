import Product from "../models/product.model.js";
import {redis} from "../lib/redis.js"; 
import cloudinary from "../lib/cloudinary.js"; 

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});// Fetch all products from the database



        res.json({ products });// Send the products as a JSON response
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
        
    }
};

export const getFeaturedProducts = async (req, res) => {
	try {
		let featuredProducts = await redis.get("featured_products");// Fetch featured products from Redis cache
		// if featured products are in redis, return them
		if (featuredProducts) {
			return res.json(JSON.parse(featuredProducts));
		}

		// if not in redis, fetch from mongodb
		// .lean() is gonna return a plain javascript object instead of a mongodb document
		// which is good for performance
		featuredProducts = await Product.find({ isFeatured: true }).lean();

		if (!featuredProducts) {
			return res.status(404).json({ message: "No featured products found" });
		}

		// store in redis for future quick access

		await redis.set("featured_products", JSON.stringify(featuredProducts));// Set the featured products in Redis cache for future quick access

		res.json(featuredProducts);
	} catch (error) {
		console.log("Error in getFeaturedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const createProduct = async (req, res) => {
	try {
		const { name, description, price, image, category } = req.body;// Destructure the request body to get product details
		// Check if all required fields are present

		let cloudinaryResponse = null;// Initialize cloudinaryResponse to null

		// Check if image is present in the request
		if (image) {
			// Upload the image to Cloudinary
			cloudinaryResponse = await cloudinary.uploader.upload(image, {
				folder: "products",// Specify the folder in Cloudinary where the image will be stored
			});// Upload the image to Cloudinary
		}

		// Create a new product in the database
		// The image URL is set to the secure_url returned by Cloudinary, or an empty string if no image was uploaded	
		const product = await Product.create({
			name,
			description,
			price,
			image: cloudinaryResponse ?.secure_url ? cloudinaryResponse.secure_url : "",
			category,
		});// Create a new product in the database

		res.status(201).json({
			message: "Product created successfully",
			product,
		});// Send a success response with the created product
	} catch (error) {
		console.log("Error in createProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
		
	}
};

export const deleteProduct = async (req, res) => {
	try {

		const product = await Product.findById(req.params.id);// Find the product by ID from the request parameters

		if (!product) {
			return res.status(404).json({ message: "Product not found" });// If the product is not found, return a 404 error
		}

		if (product.image) {
			const publicId = product.image.split("/").pop().split(".")[0];// Extract the public ID from the image URL
			try {
				await cloudinary.uploader.destroy(`products/${publicId}`);// Delete the image from Cloudinary using the public ID
				console.log("Image deleted from Cloudinary successfully");
			} catch (error) {
				console.log("Error deleting image from Cloudinary", error.message);
				return res.status(500).json({ message: "Error deleting image from Cloudinary", error: error.message });
				
			}

			await Product.findByIdAndDelete(req.params.id);// Delete the product from the database
			res.status(200).json({ message: "Product deleted successfully" });// Send a success response
		}
	} catch (error) {
		console.log("Error in deleteProduct controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
		
	}
};