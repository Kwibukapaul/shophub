import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Product, Category } from "../../types";
import { Edit2, Trash2, Plus, Minus, AlertCircle, Search } from "lucide-react";
import {
  getImagePreviewUrl,
  normalizeOptionalImageUrl,
} from "../../lib/imageUrl";

export default function StoreManagerProducts({ storeId }: { storeId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    cost_price: 0,
    category_id: "",
    long_description: "",
    stock_quantity: 0,
    sku: "",
    slug: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [storeId]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("partner_store_id", storeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const normalizedImageUrl = normalizeOptionalImageUrl(imageUrl);
      const slugify = (s: string) =>
        s
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");

      const productData: any = {
        ...formData,
        partner_store_id: storeId, // Ensure it's assigned to the manager's store
        is_active: true,
        // Products created by a store manager should be featured by default
        is_featured: editingId ? undefined : true,
        slug: formData.slug ? formData.slug : slugify(formData.name || ""),
        rating: 0,
        created_at: editingId ? undefined : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      productData.image_urls = normalizedImageUrl ? [normalizedImageUrl] : [];

      if (editingId) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingId)
          .eq("partner_store_id", storeId); // Double check ownership

        if (error) throw error;
        setMessage("Product updated successfully");
      } else {
        const { error } = await supabase.from("products").insert(productData);
        if (error) throw error;
        setMessage("Product created successfully and featured");
      }

      setFormData({
        name: "",
        description: "",
        long_description: "",
        price: 0,
        cost_price: 0,
        category_id: "",
        stock_quantity: 0,
        sku: "",
        slug: "",
      });
      setShowForm(false);
      setEditingId(null);
      setImageUrl("");
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving product");
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      cost_price: product.cost_price,
      category_id: product.category_id,
      stock_quantity: product.stock_quantity,
      sku: product.sku || "",
      long_description: product.long_description || "",
      slug: product.slug || "",
    });
    setEditingId(product.id);
    setShowForm(true);
    setImageUrl(
      product.image_urls && product.image_urls.length
        ? product.image_urls[0]
        : "",
    );
  };

  const imagePreviewUrl = getImagePreviewUrl(imageUrl);
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));
  const filteredProducts = products.filter((product) => {
    if (!normalizedSearchTerm) {
      return true;
    }

    const searchableText = [
      product.name,
      product.description,
      product.long_description,
      product.sku,
      product.slug,
      categoryNameById.get(product.category_id),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedSearchTerm);
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("partner_store_id", storeId); // Prevent deleting others' products

      if (error) throw error;
      setMessage("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting product");
    }
  };

  const updateStock = async (id: string, delta: number) => {
    setError("");
    try {
      const prod = products.find((p) => p.id === id);
      if (!prod) return;
      const newQty = Math.max(0, prod.stock_quantity + delta);

      // optimistic update locally
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, stock_quantity: newQty } : p)),
      );

      const { error } = await supabase
        .from("products")
        .update({ stock_quantity: newQty })
        .eq("id", id)
        .eq("partner_store_id", storeId);

      if (error) throw error;
      setMessage("Stock updated");
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating stock");
      fetchProducts();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Store Products
        </h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: "",
              description: "",
              long_description: "",
              price: 0,
              cost_price: 0,
              category_id: "",
              stock_quantity: 0,
              sku: "",
              slug: "",
            });
            setImageUrl("");
          }}
          className="flex items-center gap-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-medium shadow-lg"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-700 dark:text-green-300 font-medium">
            {message}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
          <AlertCircle
            className="text-red-600 dark:text-red-400 flex-shrink-0"
            size={20}
          />
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Search Products
        </label>
        <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <Search size={18} className="text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, SKU, description, slug, or category"
            className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              type="text"
              placeholder="Product Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="col-span-1 md:col-span-2 px-4 py-2 border rounded-lg bg-transparent text-gray-900 dark:text-white dark:border-gray-600"
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="col-span-1 md:col-span-2 px-4 py-2 border rounded-lg bg-transparent text-gray-900 dark:text-white dark:border-gray-600"
              rows={3}
              required
            />
            <textarea
              placeholder="Long Description (optional)"
              value={formData.long_description}
              onChange={(e) =>
                setFormData({ ...formData, long_description: e.target.value })
              }
              className="col-span-1 md:col-span-2 px-4 py-2 border rounded-lg bg-transparent text-gray-900 dark:text-white dark:border-gray-600"
              rows={4}
            />
            <select
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              className="px-4 py-2 border rounded-lg bg-transparent text-gray-900 dark:text-white dark:border-gray-600 [&>option]:text-black"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Price (RWF)"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: parseFloat(e.target.value) })
              }
              className="px-4 py-2 border rounded-lg bg-transparent text-gray-900 dark:text-white dark:border-gray-600"
              required
            />
            <input
              type="number"
              placeholder="Stock Quantity"
              value={formData.stock_quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock_quantity: parseInt(e.target.value),
                })
              }
              className="px-4 py-2 border rounded-lg bg-transparent text-gray-900 dark:text-white dark:border-gray-600"
              required
            />
            <input
              type="text"
              placeholder="SKU"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
              className="px-4 py-2 border rounded-lg bg-transparent text-gray-900 dark:text-white dark:border-gray-600"
            />
            <input
              type="text"
              placeholder="Slug (optional)"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className="px-4 py-2 border rounded-lg bg-transparent text-gray-900 dark:text-white dark:border-gray-600"
            />

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Product Image URL (optional)
              </label>
              <input
                type="text"
                placeholder="https://example.com/product-image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-900 dark:border-gray-600 dark:text-white"
                inputMode="url"
                autoCapitalize="none"
                spellCheck={false}
              />
              {imagePreviewUrl && (
                <img
                  src={imagePreviewUrl}
                  alt="Product preview"
                  className="mt-2 h-28 w-full rounded-md border object-contain"
                />
              )}
            </div>

            <div className="col-span-1 md:col-span-2 flex gap-3 mt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center h-64 items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            No products found in your store.
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            No products match "{searchTerm.trim()}".
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {p.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    RWF {p.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateStock(p.id, -1)}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-12 text-center">
                        {p.stock_quantity}
                      </span>
                      <button
                        onClick={() => updateStock(p.id, 1)}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-3">
                    <button
                      onClick={() => handleEdit(p)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
