import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { supabase } from "../lib/supabase";
import { ChevronLeft, Star } from "lucide-react";

interface PlatformReviewsProps {
  onNavigate: (page: string) => void;
}

export default function PlatformReviews({ onNavigate }: PlatformReviewsProps) {
  const { session } = useAuth();
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState("user_experience");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      onNavigate("login");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.from("website_reviews").insert({
        user_id: session.user.id,
        rating,
        category,
        comment,
        is_approved: false,
      });

      if (error) throw error;

      setMessage("Review submitted! Thank you for your feedback.");
      setRating(5);
      setCategory("user_experience");
      setComment("");

      setTimeout(() => {
        onNavigate("home");
      }, 2000);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to submit review",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-app py-12 max-w-2xl">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 font-medium"
        >
          <ChevronLeft size={20} /> Back
        </button>

        <div className="card p-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Share Your Feedback
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Help us improve ShopHub by sharing your thoughts
          </p>

          {message && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-700 dark:text-green-300 font-medium">
                {message}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-3">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="focus:outline-none transition"
                  >
                    <Star
                      size={32}
                      className={
                        value <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 dark:text-gray-600 hover:text-yellow-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="user_experience">User Experience</option>
                <option value="product_quality">Product Quality</option>
                <option value="delivery">Delivery</option>
                <option value="customer_service">Customer Service</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Your Feedback
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you think..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              ></textarea>
            </div>

            <button type="submit" disabled={loading} className="w-full btn">
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
