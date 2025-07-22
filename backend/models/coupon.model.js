import mongoose from "mongoose";

// Coupon Model
// This model defines the structure of a coupon in the database
const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    }, // Unique code for the coupon
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    }, // Discount percentage for the coupon
    expirationDate: {
      type: Date,
      required: true,
    }, // Expiration date for the coupon
    isActive: {
      type: Boolean,
      default: true,
    }, // Indicates if the coupon is active
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    }, // User ID associated with the coupon
  },
  {
    timestamps: true,
  } // Automatically manage createdAt and updatedAt timestamps
);

const Coupon = mongoose.model("Coupon", couponSchema); // Create a Mongoose model for the Coupon schema

export default Coupon;
