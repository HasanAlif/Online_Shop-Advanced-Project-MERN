import Coupon from '../models/coupon.model.js';


export const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ userId: req.user._id, isActive:true }); // Find the coupon for the logged-in user
        res.json(coupon || null); // Return the coupon if found, otherwise return null
    } catch (error) {
        console.log("Error in getCoupon controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
        
    }
};

export const validateCoupon = async (req, res) => {
	try {
		const { code } = req.body;// Get the coupon code from the request body
		const coupon = await Coupon.findOne({ code: code, userId: req.user._id, isActive: true }); // Find the coupon by code, user ID, and active status
        // Check if the coupon exists and is active

		if (!coupon) {
			return res.status(404).json({ message: "Coupon not found" });
		}

        // Check if the coupon has expired
		if (coupon.expirationDate < new Date()) {
			coupon.isActive = false;
			await coupon.save();
			return res.status(404).json({ message: "Coupon expired" });
		}// If the coupon has expired, set it to inactive and save it

		res.json({
			message: "Coupon is valid",
			code: coupon.code,
			discountPercentage: coupon.discountPercentage,
		});// Return the coupon details if valid
	} catch (error) {
		console.log("Error in validateCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};