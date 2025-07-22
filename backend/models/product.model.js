import mongoose from "mongoose";


// Define the product schema
// The schema defines the structure of the product documents in the MongoDB collection
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
    },// Name of the product
    description: {
      type: String,
      required: [true, "Please enter product description"],
    },// Description of the product
    price: {
      type: Number,
      min:0,
      required: [true, "Please enter product price"],
    },// Price of the product
    image: {
      type: String,
      required: [true, "Please enter product image URL"],
    },// Image URL of the product
    category: {
      type: String,
      required: [true, "Please enter product category"],
    },// Category of the product
    isFeatured: {
      type: Boolean,
      default: false,
    },// Indicates if the product is featured
  },
  {
    timestamps: true,
  }
);


const Product = mongoose.model("Product", productSchema);// Create the Product model


export default Product;