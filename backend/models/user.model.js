import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Define the product schema
// The schema defines the structure of the product documents in the MongoDB collection
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },// Name of the user
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      lowercase: true,
      trim: true,
    },// Email of the user
    // Email must be unique, lowercase, and trimmed
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [6, "Password must be at least 6 characters"],
    },// Password of the user, must be at least 6 characters long
    // Password must be at least 6 characters long
    cartItems: [
      {
        quantity: {
          type: Number,
          default: 1,
        },// Quantity of the product in the cart, default is 1
        // Default quantity is 1 if not specified
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },// Product ID associated with the cart item
        // Product ID is a reference to the Product model
      },// Cart items are an array of objects containing product ID and quantity
    ],// Cart items are an array of objects containing product ID and quantity
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },// Role of the user, can be either 'customer' or 'admin', default is 'customer'
    // Role can be either 'customer' or 'admin', default is 'customer'
  },// User schema defines the structure of the user documents in the MongoDB collection
  {
    timestamps: true,
  }// Automatically manage createdAt and updatedAt timestamps
);

// Pre-save middleware to hash the password before saving the user
// This middleware runs before saving a user document to the database
userSchema.pre("save", async function (next) {
  // Check if the password is modified (i.e., if it's a new user or password is updated)
  // If the password is not modified, skip hashing
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);// Generate a salt for hashing
    this.password = await bcrypt.hash(this.password, salt);// Hash the password using the generated salt
    next();// Proceed to the next middleware or save the user document
  } catch (error) {
    return next(error);
  }
});

// Method to compare the provided password with the hashed password in the database
// This method is used for user authentication
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);// Compare the provided password with the hashed password
}

const User = mongoose.model("User", userSchema);// Create the User model
// The User model is used to interact with the "users" collection in the MongoDB database

export default User;
