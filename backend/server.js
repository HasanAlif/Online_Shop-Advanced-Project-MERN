import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import {connectDB} from './lib/db.js';
import cookieParser from 'cookie-parser';
import productRoutes from './routes/product.route.js';


dotenv.config();// Initialize dotenv to load environment variables


const app = express();


app.use(express.json());// Middleware to parse JSON request bodies
app.use(cookieParser());// Middleware to parse cookies


app.use("/api/auth", authRoutes);// Define the authentication routes
app.use("/api/products", productRoutes);// Define the product routes

const PORT = process.env.PORT || 5000;// Set the port for the server

app.listen(PORT, () => {
  console.log('Server is running on port '+ PORT);
  connectDB();
});