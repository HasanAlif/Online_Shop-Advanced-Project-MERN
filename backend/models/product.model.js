import mongoose from "mongoose";


const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
    },
    description: {
      type: String,
      required: [true, "Please enter product description"],
    },
    price: {
      type: Number,
      min:0,
      required: [true, "Please enter product price"],
    },
    image: {
      type: String,
      required: [true, "Please enter product image URL"],
    },
    category: {
      type: String,
      required: [true, "Please enter product category"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


const Product = mongoose.model("Product", productSchema);// Create the Product model


export default Product;