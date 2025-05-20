import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Define the product schema
// The schema defines the structure of the product documents in the MongoDB collection
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    cartItems: [
      {
        quantity: {
          type: Number,
          default: 1,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
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
