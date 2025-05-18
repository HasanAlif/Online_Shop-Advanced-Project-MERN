import express from "express";
import {
  Signup,
  Login,
  Logout,
  refreshToken,
  getProfile,
} from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/signup", Signup);

router.post("/login", Login);

router.post("/logout", Logout);

router.post("/refresh-token", refreshToken);

router.get("/profile", getProfile);

export default router;
