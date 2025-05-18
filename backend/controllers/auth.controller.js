import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";

// Function to generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

//Save the referesh token in the database
const storeRefreshToken = async (userId, refreshToken) => {
  // Store the refresh token in Redis with an expiration time
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  ); // 7 days
};

const setCookies = (res, accessToken, refreshToken) => {
  // Set the access token and refresh token as cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: "strict", // Prevents CSRF attacks
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Set the refresh token as a cookie
  // Note: Refresh token is not httpOnly to allow client-side access for refreshing the access token
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const Signup = async (req, res) => {
  // Validate request body
  const { name, email, password } = req.body;

  try {
    //Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    //Create a new user
    const user = await User.create({ name, email, password });

    //Authenticate the user
    const { accessToken, refreshToken } = generateTokens(user._id);

    //Store the refresh token in Redis
    await storeRefreshToken(user._id, refreshToken);

    //Send the tokens to the client
    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      // Send the user data and message in the response
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "User created successfully",
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: "Error creating user", error });
  }
};

export const Login = async (req, res) => {
  res.send("login Auth route is working");
};

export const Logout = async (req, res) => {
  res.send("logout Auth route is working");
};
