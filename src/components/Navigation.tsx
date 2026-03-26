import {
  ShoppingCart,
  User,
  LogOut,
  Moon,
  Sun,
  MoreHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/ThemeContext";
import { UserProfile, supabase } from "../lib/supabase";
import { useEffect, useState } from "react";

interface NavigationProps {
  userProfile?: UserProfile | null;
}

export default function Navigation({ userProfile }: NavigationProps) {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [categories, setCategories] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await supabase
          .from("categories")
          .select("*")
          .order("display_order");
        setCategories(data || []);
      } catch (err) {
        console.error("Failed fetching categories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/")}
            className="font-bold text-2xl text-blue-600"
          >
            ShopHub
          </button>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate("/")}>Home / Shop</button>

            <div className="relative">
              <button onClick={() => setCatOpen((s) => !s)} className="">
                Categories ▾
              </button>
              {catOpen && (
                <div className="absolute left-0 mt-2 bg-white dark:bg-gray-800 border rounded shadow-md p-2">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCatOpen(false);
                        navigate(`/category/${c.slug}`);
                      }}
                      className="block w-full text-left px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => navigate("/contact")}>Contact Us</button>
            <button onClick={() => navigate("/about")}>About</button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/cart")}>
            {" "}
            <ShoppingCart />{" "}
          </button>

          {session ? (
            <div className="relative">
              <button onClick={() => setMenuOpen((s) => !s)} aria-label="menu">
                <MoreHorizontal />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border rounded shadow-md p-2">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 w-full px-2 py-2 text-left"
                  >
                    {isDark ? <Sun size={16} /> : <Moon size={16} />} Theme
                  </button>

                  <button
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-2 w-full px-2 py-2 text-left"
                  >
                    <User size={16} /> Profile
                  </button>

                  <button
                    onClick={() => navigate("/settings")}
                    className="flex items-center gap-2 w-full px-2 py-2 text-left"
                  >
                    Settings
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-2 py-2 text-left"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={() => navigate("/login")}>Login</button>
              <button onClick={() => navigate("/signup")}>Sign Up</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
