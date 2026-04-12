import { addToCart } from "../lib/cart";
import { useAuth } from "../context/useAuth";

export default function ProductCard({ product }: any) {
  const { session } = useAuth();

  const handleAdd = async () => {
    if (!session?.user) {
      alert("Please login to add items to cart");
      return;
    }

    await addToCart(session.user.id, product.id);
    alert("Added to cart");
  };

  return (
    <div className="border rounded p-4">
      <img src={product.image_url} alt={product.name} className="h-40 w-full object-cover" />
      <h3 className="mt-2 font-semibold">{product.name}</h3>
      <p className="text-sm text-gray-500">{product.description}</p>
      <p className="font-bold mt-2">${product.price}</p>

      <button
        onClick={handleAdd}
        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Add to Cart
      </button>
    </div>
  );
}
