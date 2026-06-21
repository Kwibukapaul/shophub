import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // 👈 Added Link
import { useAuth } from "../../context/useAuth";
import { Mail, Lock, AlertCircle } from "lucide-react";

export default function Login() {
  const { signInWithPassword, session, role, initialized } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 🔁 Redirect AFTER role is known
  useEffect(() => {
    if (initialized && session) {
      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else if (role === "store_manager") {
        navigate("/store-manager", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [session, role, initialized, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signInWithPassword(email, password);
      // No need to navigate here, the useEffect above handles it!
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md card p-8">
        <h1 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white">
          Welcome Back
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          Sign in to your account
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg flex gap-2 items-center">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              {/* 👇 Added Forgot Password Link */}
              <Link
                to="/reset-password"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button disabled={submitting} className="w-full btn">
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* 👇 Added Sign Up Link */}
        <div className="mt-6 text-center text-sm text-slate-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
