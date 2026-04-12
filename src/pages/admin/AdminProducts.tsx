import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Product, Category } from "../../types";
import { Edit2, Trash2, Plus, AlertCircle, Search } from "lucide-react";
import {
  getImagePreviewUrl,
  normalizeOptionalImageUrl,
} from "../../lib/imageUrl";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [partnerStores, setPartnerStores] = useState<any[]>([]);
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
    long_description: "",
    price: 0,
    cost_price: 0,
    category_id: "",
    partner_store_id: "",
    stock_quantity: 0,
    sku: "",
    is_featured: false,
    slug: "",
    rating: 0,
  });
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchPartnerStores();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
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

  const fetchPartnerStores = async () => {
    try {
      const { data, error } = await supabase
        .from("partner_stores")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      setPartnerStores(data || []);
    } catch (err) {
      console.error("Error fetching partner stores:", err);
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
        partner_store_id: formData.partner_store_id || null,
        is_featured: Boolean(formData.partner_store_id),
        is_active: true,
        slug: formData.slug ? formData.slug : slugify(formData.name || ""),
        created_at: editingId ? undefined : new Date().toISOString(),
        updated_at: new Date().toISOString(),
        rating: formData.rating || 0,
      };
      productData.image_urls = normalizedImageUrl ? [normalizedImageUrl] : [];

      if (editingId) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingId);

        if (error) throw error;
        setMessage("Product updated successfully");
      } else {
        const { error } = await supabase.from("products").insert(productData);

        if (error) throw error;
        setMessage("Product created successfully");
      }

      setFormData({
        name: "",
        description: "",
        long_description: "",
        price: 0,
        cost_price: 0,
        category_id: "",
        partner_store_id: "",
        stock_quantity: 0,
        sku: "",
        is_featured: false,
        slug: "",
        rating: 0,
      });
      setImageUrl("");
      setShowForm(false);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving product");
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      long_description: product.long_description || "",
      price: product.price,
      cost_price: product.cost_price,
      category_id: product.category_id,
      partner_store_id: product.partner_store_id || "",
      stock_quantity: product.stock_quantity,
      sku: product.sku || "",
      is_featured: product.is_featured,
      slug: product.slug || "",
      rating: product.rating || 0,
    });
    setEditingId(product.id);
    setImageUrl(
      product.image_urls && product.image_urls.length
        ? product.image_urls[0]
        : "",
    );
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;
      setMessage("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting product");
    }
  };

  const profit = formData.price - formData.cost_price;
  const margin =
    formData.price > 0 ? ((profit / formData.price) * 100).toFixed(1) : "0";
  const imagePreviewUrl = getImagePreviewUrl(imageUrl);
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));
  const partnerStoreNameById = new Map(
    partnerStores.map((store) => [store.id, store.name]),
  );
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
      product.partner_store_id
        ? partnerStoreNameById.get(product.partner_store_id)
        : null,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedSearchTerm);
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Products Management
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
              partner_store_id: "",
              stock_quantity: 0,
              sku: "",
              is_featured: false,
              slug: "",
              rating: 0,
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
            placeholder="Search by name, SKU, description, category, or store"
            className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6 mb-8 border border-gray-200 dark:border-gray-700">
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
              className="col-span-1 md:col-span-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="col-span-1 md:col-span-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              required
            ></textarea>

            <textarea
              placeholder="Long Description (optional)"
              value={formData.long_description}
              onChange={(e) =>
                setFormData({ ...formData, long_description: e.target.value })
              }
              className="col-span-1 md:col-span-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={4}
            ></textarea>

            <select
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
              onChange={(e) => {
                const v = e.target.value;
                setFormData({
                  ...formData,
                  price: v === "" ? 0 : parseFloat(v),
                });
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />

            <input
              type="number"
              placeholder="Cost Price (RWF)"
              value={formData.cost_price}
              onChange={(e) => {
                const v = e.target.value;
                setFormData({
                  ...formData,
                  cost_price: v === "" ? 0 : parseFloat(v),
                });
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />

            <input
              type="text"
              placeholder="Slug (optional)"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />

            <input
              type="number"
              placeholder="Rating (0-5)"
              value={formData.rating}
              onChange={(e) =>
                setFormData({ ...formData, rating: Number(e.target.value) })
              }
              min={0}
              max={5}
              step={0.1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />

            <input
              type="number"
              placeholder="Stock Quantity"
              value={formData.stock_quantity}
              onChange={(e) => {
                const v = e.target.value;
                setFormData({
                  ...formData,
                  stock_quantity: v === "" ? 0 : parseInt(v),
                });
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />

            <input
              type="text"
              placeholder="SKU"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />

            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <select
                value={formData.partner_store_id}
                onChange={(e) =>
                  setFormData({ ...formData, partner_store_id: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">No Featured Store</option>
                {partnerStores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Product Image URL
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
            </div>

            {formData.price > 0 && (
              <div className="col-span-1 md:col-span-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Profit: RWF{" "}
                  {(formData.price - formData.cost_price).toLocaleString()} |
                  Margin: {margin}%
                </p>
              </div>
            )}

            <div className="col-span-1 md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-medium"
              >
                {editingId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">No products found</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            No products match "{searchTerm.trim()}".
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 overflow-x-auto border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
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
                  Margin
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => {
                const margin =
                  product.price > 0
                    ? (
                        ((product.price - product.cost_price) / product.price) *
                        100
                      ).toFixed(1)
                    : "0";
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      RWF {product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={
                          product.stock_quantity > 0
                            ? "text-green-600 dark:text-green-400 font-bold"
                            : "text-red-600 dark:text-red-400 font-bold"
                        }
                      >
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                      {margin}%
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
