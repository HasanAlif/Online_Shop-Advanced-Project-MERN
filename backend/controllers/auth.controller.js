import User from "../models/user.model.js";

export const Signup = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }
  try {
    const user = await User.create({ name, email, password });
    res.status(201).json({ user, message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
  
}

export const Login = async (req, res) => {
  res.send("login Auth route is working");
}

export const Logout = async (req, res) => {
  res.send("logout Auth route is working");
}