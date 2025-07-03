import Order from "../models/user.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

// Analytics data
export const getAnalyticsData = async (req, res) => {
  const totalUsers = await User.countDocuments(); // Count total number of users
  const totalProducts = await Product.countDocuments(); // Count total number of products

  // Aggregate sales data
  const salesData = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },// Count total number of sales
        totalRevenue: { $sum: "$totalAmount" },// Sum total revenue from all orders
      },
    },
  ]);

  // Example of salesData
  const { totalSales, totalRevenue } = salesData[0] || {
    totalSales: 0,
    totalRevenue: 0,
  };

  // Return the analytics data
  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue,
  };
};

// Get daily sales data for a given date range
// This function retrieves daily sales data between startDate and endDate
export const getDailySalesData = async (startDate, endDate) => {
  try {
    const dailySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    //Example of daily sales Data
    //   [
    //     {
    //         _id: "2024-08-18",
    //         sales: 12,
    //         revenue: 1450.75
    //     },
    //     {
    //         _id: "2024-08-19",
    //         sales: 2,
    //         revenue: 1450.75
    //     },
    //   ]

    const dateArray = getDatesInRange(startDate, endDate); // Generate an array of dates between startDate and endDate

    // Example of dateArray
    return dateArray.map((date) => {
      const foundData = dailySalesData.find((item) => item._id === date); // Find the sales data for the current date

      return {
        date,
        sales: foundData?.sales || 0, // If no data found for the date, default to 0
        revenue: foundData?.revenue || 0, // If no data found for the date, default to 0
      };
    });
  } catch (error) {
    throw error;
  }
};

// Helper function to generate an array of dates between startDate and endDate
// This function returns an array of dates in "YYYY-MM-DD" format
function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);// Convert date to "YYYY-MM-DD" format
    currentDate.setDate(currentDate.getDate() + 1); // Increment the current date by one day
  }

  return dates;
}
