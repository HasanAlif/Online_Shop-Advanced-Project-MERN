import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

// Zustand store for user management
// This store handles user authentication, including signup, login, logout, and checking authentication status.
export const useUserStore = create((set,get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  signup: async ({ name, email, password, confirmPassword }) => {// Function to handle user signup
    set({ loading: true });

    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Passwords do not match");
    }

    try {
      const res = await axios.post("/auth/signup", { name, email, password });// Make a POST request to signup endpoint
      set({ user: res.data, loading: false });// Update the user state with the response data
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.message || "An error occurred");
    }
  },
  login: async (email, password) => {// Function to handle user login
		set({ loading: true });

		try {
			const res = await axios.post("/auth/login", { email, password });// Make a POST request to login endpoint

			set({ user: res.data, loading: false });
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.message || "An error occurred");
		}
	},
    logout: async () => {// Function to handle user logout
		try {
			await axios.post("/auth/logout");// Make a POST request to logout endpoint
			set({ user: null });
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred during logout");
		}
	},
    checkAuth: async () => {// Function to check if the user is authenticated
		set({ checkingAuth: true });
		try {
			const response = await axios.get("/auth/profile");// Make a GET request to profile endpoint
			set({ user: response.data, checkingAuth: false });// Update the user state with the response data
		} catch (error) {
			console.log(error.message);
			set({ checkingAuth: false, user: null });
		}
	},
	refreshToken: async () => {
		// Prevent multiple simultaneous refresh attempts
		if (get().checkingAuth) return;

		set({ checkingAuth: true });
		try {
			const response = await axios.post("/auth/refresh-token");
			set({ checkingAuth: false });
			return response.data;
		} catch (error) {
			set({ user: null, checkingAuth: false });
			throw error;
		}
	},
}));
