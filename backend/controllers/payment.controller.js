import { stripe } from "../lib/stripe.js";
import Order from "../models/order.model.js";
import Coupon from "../models/coupon.model.js";

// Create a new checkout session
// This function creates a new checkout session with Stripe for the provided products and optional coupon code
export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body; // Extract products and coupon code from the request body

    // Validate products array
    // If products is not an array or is empty, return a 400 Bad Request response
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }
    let totalAmount = 0;

    // Map through the products to create line items for the Stripe session
    // Each line item includes product data, price, and quantity
    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100);
      totalAmount += amount * product.quantity;

      // Return the line item object for Stripe
      // Each line item includes product data, price, and quantity
      return {
        price_data: {
          currency: "EUR",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
      };
    });
    let coupon = null;
    // If a coupon code is provided, check if it exists and is active for the user
    // If the coupon is valid, apply the discount to the total amount
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });
      // If the coupon exists and is active, apply the discount to the total amount
      // The discount is calculated as a percentage of the total amount
      if (coupon) {
        totalAmount -= Math.round(
          (totalAmount * coupon.discountPercentage) / 100
        );
      }
    }
    // Create a new Stripe checkout session with the line items and optional coupon
    // The session includes payment method types, success and cancel URLs, and metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: coupon
        ? [
            {
              coupon: await createStripeCoupon(coupon.discountPercentage),
            },
          ]
        : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
      },
    });
    if (totalAmount >= 20000) {
      await createNewCoupon(req.user._id);
    }
    res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
  } catch (error) {}
};

// Handle successful checkout session
// This function processes the successful checkout session and creates an order in the database
export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      if (session.metadata.couponCode) {
        await Coupon.finfOneAndUpdate(
          {
            code: session.metadata.couponCode,
            userId: session.metadata.userId,
          },
          {
            isActive: false,
          }
        );
      }
      // Create a new order in the database with the session data
      // The order includes user ID, products, total amount, and Stripe session ID
      const products = JSON.parse(session.metadata.products);
      const newOrder = new Order({
        user: session.metadata.userId,
        products: products.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalAmount: session.amount_total / 100,
        stripeSessionId: sessionId,
      });
      await newOrder.save();

      res.status(200).json({
        success: true,
        message:
          "Payment Successful, Oreder Created and Coupon deactivated if used",
        orderId: newOrder._id,
      });
    }
  } catch (error) {
    console.error("Error processing successful checkout:", error);
    res.status(500).json({
      message: "Error processing successful checkout",
      error: error.message,
    });
  }
};

// Handle canceled checkout session
// This function processes the canceled checkout session and returns a message
async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });
  return coupon.id;
}

// Create a new coupon for the user
// This function creates a new coupon with a unique code, discount percentage, expiration date, and user ID
async function createNewCoupon(userId) {
  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 1000),
    userId: userId,
  });
  await newCoupon.save();

  return newCoupon;
}
