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
  try {
    // Get the email and password from the request body
    const { email, password } = req.body;

    // Validate request body
    const user = await User.findOne({ email });

    //Check if the user exists
    // If the user does not exist, return an error
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //Check if the password is correct
    // If the user exists and the password is correct, generate tokens
    if (user && (await user.comparePassword(password))) {
      //Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id);

      //Store the refresh token in Redis
      await storeRefreshToken(user._id, refreshToken);

      //Set cookies
      setCookies(res, accessToken, refreshToken);

      //Send the user data and message in the response
      res.status(200).json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: "Login successful",
      });
    }
  } catch (error) {
    // Handle errors
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server Error", error });
  }
};

export const Logout = async (req, res) => {
  try {
    // Get the refresh token from the request
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      // Get the user ID from the refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      // Delete the refresh token from Redis
      await redis.del(`refresh_token:${decoded.userId}`);
    }
    // Clear the cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error for logging out", error });
  }
};

export const refreshToken = async (req, res) => {
  try {
    // Get the refresh token from the request
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Check if the refresh token is in Redis
    const storedToken = await redis.get(
      `refresh_token:${decoded.userId}`
    );

    if (!storedToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Generate new tokens
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    // Generate a new refresh token
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
  

    res.status(200).json({ message: "Tokens refreshed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error for refreshing tokens", error });
  }
};
