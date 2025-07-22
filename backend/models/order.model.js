import mongoose from "mongoose";

// Order Model
// This model defines the structure of an order in the database
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // User ID associated with the order
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        }, // Product ID associated with the order
        quantity: {
          type: Number,
          required: true,
          min: 1,
        }, // Quantity of the product in the order
        price: {
          type: Number,
          required: true,
          min: 0,
        }, // Price of the product at the time of the order
      },
    ], // Array of products in the order, each with its quantity and price
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    }, // Total amount for the order
    stripeSessionId: {
      type: String,
      unique: true,
    }, // Stripe session ID for payment processing
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema); // Create a Mongoose model for the Order schema

export default Order;
