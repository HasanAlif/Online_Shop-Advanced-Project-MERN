import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken; // Get the access token from cookies

    // Check if the access token is provided
    if (!accessToken) {
      return res.status(401).json({ message: "No access token provided" });
    }
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET); // Verify the access token
      const user = await User.findById(decoded.userId).select("-password"); // Find the user by ID excluding the password

      // Check if the user exists
      if (!user) {
        return res
          .status(401)
          .json({ message: "Unauthorized: User Not Found" });
      }

      req.user = user; // Attach the user to the request object

      next(); // Call the next middleware or route handler
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Access token expired" });
      }
      throw error; // Rethrow the error to be handled by the global error handler
    }
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error });
  }
};


export const adminRoute = async (req, res, next) => {
    if(req.user && req.user.role === "admin") {
        next(); // Call the next middleware or route handler
    }else {
        return res.status(403).json({ message: "Access Denied: Admins only" });
    }
};