import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";

const ProductCard = ({ product }) => {
	const { user } = useUserStore();
	const { addToCart } = useCartStore();
	
	// Debug: log the product data
	console.log('ProductCard product:', product);
	
	const handleAddToCart = () => {
		if (!user) {
			toast.error("Please login to add products to cart", { id: "login" });
			return;
		} else {
			// add to cart
			addToCart(product);
		}
	};

	return (
		<div className='flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg'>
			<div className='relative mx-3 mt-3 h-60 overflow-hidden rounded-xl bg-gray-200'>
				<img 
					className='w-full h-full object-cover' 
					src={product.image || 'https://via.placeholder.com/300x200?text=No+Image'} 
					alt={product.name || 'product image'}
					style={{ display: 'block' }}
					onLoad={() => console.log('Image loaded successfully:', product.image)}
					onError={(e) => {
						console.log('Image failed to load:', product.image);
						console.log('Error details:', e);
						e.target.src = 'https://via.placeholder.com/300x200?text=Image+Failed';
					}}
				/>
			</div>

			<div className='mt-4 px-5 pb-5'>
				<h5 className='text-xl font-semibold tracking-tight text-white'>{product.name}</h5>
				<div className='mt-2 mb-5 flex items-center justify-between'>
					<p>
						<span className='text-3xl font-bold text-emerald-400'>
							${typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
						</span>
					</p>
				</div>
				<button
					className='flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm font-medium
					 text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300'
					onClick={handleAddToCart}
				>
					<ShoppingCart size={22} className='mr-2' />
					Add to cart
				</button>
			</div>
		</div>
	);
};
export default ProductCard;
