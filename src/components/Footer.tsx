import {
  Twitter,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-12 bg-transparent">
      <div className="container-app grid md:grid-cols-3 gap-8 py-12">
        <div>
          <h4 className="font-bold text-lg text-slate-900 dark:text-white">
            ShopHub
          </h4>
          <p className="text-sm mt-3 text-slate-600 dark:text-slate-300">
            Making ethical, high-quality shopping accessible while connecting
            people and partner stores.
          </p>

          <div className="flex gap-3 mt-4">
            <a
              aria-label="twitter"
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center dark:bg-gray-800"
            >
              <Twitter size={14} />
            </a>
            <a
              aria-label="facebook"
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center dark:bg-gray-800"
            >
              <Facebook size={14} />
            </a>
            <a
              aria-label="instagram"
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center dark:bg-gray-800"
            >
              <Instagram size={14} />
            </a>
          </div>
        </div>

        <div>
          <h5 className="font-semibold text-slate-900 dark:text-white">
            Quick Links
          </h5>
          <ul className="mt-3 text-sm text-slate-600 dark:text-slate-300 space-y-2">
            <li
              onClick={() => (window.location.href = "/about")}
              className="cursor-pointer"
            >
              About Us
            </li>
            <li
              onClick={() => (window.location.href = "/")}
              className="cursor-pointer"
            >
              Shop
            </li>
            <li className="cursor-pointer">Community</li>
            <li className="cursor-pointer">Learn</li>
            <li className="cursor-pointer">Partner Stores</li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold text-slate-900 dark:text-white">
            Featured Categories
          </h5>
          <div className="mt-3 flex flex-col gap-3">
            <button
              onClick={() => (window.location.href = "/category/electronics")}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-gray-700"
            >
              <img
                src="/icons/electronics.svg"
                alt="Electronics"
                className="h-6 w-6 rounded"
              />
              Electronics
            </button>

            <button
              onClick={() => (window.location.href = "/category/fashion")}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-gray-700"
            >
              <img
                src="/icons/fashion.svg"
                alt="Fashion"
                className="h-6 w-6 rounded"
              />
              Fashion
            </button>

            <div className="mt-2 text-xs text-slate-500">
              Focused collections curated for style and tech.
            </div>
          </div>
        </div>

        <div>
          <h5 className="font-semibold text-slate-900 dark:text-white">
            Support
          </h5>
          <ul className="mt-3 text-sm text-slate-600 dark:text-slate-300 space-y-2">
            <li
              onClick={() => (window.location.href = "/contact")}
              className="cursor-pointer flex items-center gap-2"
            >
              <Mail size={14} /> Contact Us
            </li>
            <li className="flex items-center gap-2">
              <Phone size={14} /> FAQ
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={14} /> Shipping Information
            </li>
            <li className="cursor-pointer">Returns & Refunds</li>
            <li className="cursor-pointer">Privacy Policy</li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="container-app py-6 text-sm text-slate-500 flex flex-col md:flex-row justify-between">
          <div>
            <div className="font-semibold text-slate-700 dark:text-slate-300">
              Contact Info
            </div>
            <div className="mt-2 text-slate-600 dark:text-slate-300">
              Brussels, Belgium • +32 2 123 4567 • info@shophub.example.com
            </div>
          </div>

          <div className="mt-4 md:mt-0">
            © {new Date().getFullYear()} ShopHub. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
