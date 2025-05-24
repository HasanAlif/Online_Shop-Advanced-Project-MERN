import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
    try {
        const products = await Product.find({ _id: { $in: req.user.cartItems } }) // Find products in the cart by their IDs

        const cartItems = products.map(product => {
            const item = req.user.cartItems.find(cartItem => cartItem.id === product.id); // Find the corresponding cart item
            return{...product.toJSON(), quantity: item.quantity}; // Return the product with its quantity
        })
    } catch (error) {
        console.log("Error in getCartProducts controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
        
    }
};


export const addToCart = async (req, res) => {
    try {
        const {productId} = req.body; // Get productId from request body
        const user = req.user; // Get user from request object (assumed to be set by auth middleware)

        const existingItem = user.cartItems.find(item => item.id === productId); // Check if the product is already in the cart
        if (existingItem) {
            // If the product is already in the cart, increment the quantity
            existingItem.quantity += 1;
        } else {
            // If the product is not in the cart, add it with quantity 1
            user.cartItems.push({ productId});
        }
        await user.save(); // Save the updated user document to the database
        res.status(200).json(user.cartItems); // Send success response with updated cart
    } catch (error) {
        console.log("Error in addToCart controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
        
    }
};


export const removeAllFromCart = async (req, res) => {
    try {
        const {productId} = req.body; // Get productId from request body
        const user = req.user; // Get user from request object (assumed to be set by auth middleware)
        if(!productId){
            user.cartItems = []; // If no productId is provided, clear the entire cart
        }else{
            user.cartItems = user.cartItems.filter((item) => item.id !== productId); // Remove the specific product from the cart
        }
        await user.save(); // Save the updated user document to the database
        res.status(200).json(user.cartItems); // Send success response with updated cart
    } catch (error) {
        console.log("Error in removeAllFromCart controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
        
    }
};


export const updateQuantity = async (req, res) => {
    try {
        const {id: productId} = req.params; // Get productId from request parameters
        const {quantity} = req.body; // Get quantity from request body
        const user = req.user; // Get user from request object (assumed to be set by auth middleware)
        const existingItem = user.cartItems.find(item => item.id === productId); // Check if the product is in the cart
        if (existingItem){
            if (quantity === 0 ){
                user.cartItems = user.cartItems.filter((item) => item.id !== productId); // If quantity is 0, remove the product from the cart
                await user.save(); // Save the updated user document to the database
                res.status(200).json(user.cartItems); // Send success response with updated cart
            }

            existingItem.quantity = quantity; // Update the quantity of the product in the cart
            await user.save(); // Save the updated user document to the database
            res.status(200).json(user.cartItems); // Send success response with updated cart
        }
    } catch (error) {
        console.log("Error in updateQuantity controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
        
    }
};