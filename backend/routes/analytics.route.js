import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { getAnalyticsData, getDailySalesData } from "../controllers/analytics.controller.js"

const router = express.Router();

// Import the necessary functions from your analytics controller
router.get("/",protectRoute,adminRoute , async(req , res) => {
    try {
        const analyticsData = await getAnalyticsData();// Fetch analytics data from the controller

        const endDate = new Date();// Get the current date
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);// Calculate the start date as 7 days before the end date

        const dailySalesData = await getDailySalesData(startDate, endDate);// Fetch daily sales data for the last 7 days

        res.json({// Send the analytics data and daily sales data as a response
            analyticsData,
            dailySalesData
        })
    } catch (error) {
        console.log("Error in analytics route", error.message);
        res.status(500).json({ message: "Server Error", error:error.message})
    }
})

export default router;