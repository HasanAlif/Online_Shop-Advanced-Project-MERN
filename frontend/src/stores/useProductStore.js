import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

// Zustand store for product management
export const useProductStore = create((set) => ({// Initial state
	products: [],// Array to hold products
	loading: false,// Loading state

	setProducts: (products) => set({ products }),// Action to set products
	createProduct: async (productData) => {// Function to create a new product
		set({ loading: true });// Set loading state to true
		try {// Make a POST request to create a new product
			const res = await axios.post("/products", productData);// Send product data to the server
			set((prevState) => ({// Update the state with the new product
				products: [...prevState.products, res.data],// Add the new product to the existing products array
				loading: false,
			}));
		} catch (error) {
			toast.error(error.response.data.error);
			set({ loading: false });
		}
	},
	fetchAllProducts: async () => {// Function to fetch all products
		set({ loading: true });
		try {
			const response = await axios.get("/products");// Make a GET request to fetch all products
			set({ products: response.data.products, loading: false });// Update the state with the fetched products
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response.data.error || "Failed to fetch products");
		}
	},
	fetchProductsByCategory: async (category) => {// Function to fetch products by category
		set({ loading: true });
		try {
			const response = await axios.get(`/products/category/${category}`);// Make a GET request to fetch products by category
			set({ products: response.data.products, loading: false });// Update the state with the fetched products
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			toast.error(error.response.data.error || "Failed to fetch products");
		}
	},
	deleteProduct: async (productId) => {// Function to delete a product
		set({ loading: true });
		try {
			await axios.delete(`/products/${productId}`);// Make a DELETE request to delete the product
			set((prevProducts) => ({
				products: prevProducts.products.filter((product) => product._id !== productId),// Filter out the deleted product from the products array
				loading: false,
			}));
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.error || "Failed to delete product");
		}
	},
	toggleFeaturedProduct: async (productId) => {// Function to toggle the featured status of a product
		set({ loading: true });
		try {
			const response = await axios.patch(`/products/${productId}`);// Make a PATCH request to toggle the featured status
			// this will update the isFeatured prop of the product
			set((prevProducts) => ({
				products: prevProducts.products.map((product) =>
					product._id === productId ? { ...product, isFeatured: response.data.isFeatured } : product
				),// Update the product in the products array
				loading: false,
			}));
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.error || "Failed to update product");
		}
	},
	fetchFeaturedProducts: async () => {// Function to fetch featured products
		set({ loading: true });
		try {
			const response = await axios.get("/products/featured");// Make a GET request to fetch featured products
			set({ products: response.data, loading: false });// Update the state with the fetched products
		} catch (error) {
			set({ error: "Failed to fetch products", loading: false });
			console.log("Error fetching featured products:", error);
		}
	},
}));
