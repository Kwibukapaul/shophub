export default function Footer() {
  return (
    <footer className="bg-green-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6">
        <div>
          <h4 className="font-bold text-lg">ShopHub</h4>
          <p className="text-sm mt-3 text-green-200">
            Making ethical, high-quality shopping accessible while connecting
            people and partner stores.
          </p>

          <div className="flex gap-3 mt-4">
            <a className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center">
              F
            </a>
            <a className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center">
              T
            </a>
            <a className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center">
              I
            </a>
            <a className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center">
              Y
            </a>
          </div>
        </div>

        <div>
          <h5 className="font-semibold">Quick Links</h5>
          <ul className="mt-3 text-sm text-green-200 space-y-2">
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
            <li>Community</li>
            <li>Learn</li>
            <li>Partner Stores</li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold">Support</h5>
          <ul className="mt-3 text-sm text-green-200 space-y-2">
            <li
              onClick={() => (window.location.href = "/contact")}
              className="cursor-pointer"
            >
              Contact Us
            </li>
            <li>FAQ</li>
            <li>Shipping Information</li>
            <li>Returns & Refunds</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-green-800">
        <div className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-2">
          <div>
            <h6 className="font-semibold text-green-200">Contact Info</h6>
            <p className="text-sm text-green-200 mt-2">Brussels, Belgium</p>
            <p className="text-sm text-green-200">+32 2 123 4567</p>
            <p className="text-sm text-green-200">info@shophub.example.com</p>
          </div>

          <div>
            <h6 className="font-semibold text-green-200">Founders</h6>
            <p className="text-sm text-green-200 mt-2">
              Alex Johnson — alex@shophub.example.com — @alexjohnson
            </p>
            <p className="text-sm text-green-200">
              Priya Singh — priya@shophub.example.com — @priyasingh
            </p>
            <p className="text-sm text-green-200">
              Daniel Mwangi — daniel@shophub.example.com — @danielmwangi
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-4 text-xs text-green-200">
          © {new Date().getFullYear()} ShopHub. All rights reserved. Making
          ethical living accessible to everyone.
        </div>
      </div>
    </footer>
  );
}
