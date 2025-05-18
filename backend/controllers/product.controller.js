import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});// Fetch all products from the database



        res.json({ products });// Send the products as a JSON response
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
        
    }
};