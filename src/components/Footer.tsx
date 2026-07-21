import {
  Twitter,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  staggerContainerVariants,
  staggerItemVariants,
  fadeInUpVariants,
} from "../lib/animationPresets";

export default function Footer() {
  const socialLinks = [
    { icon: Twitter, label: "twitter", href: "#" },
    { icon: Facebook, label: "facebook", href: "#" },
    { icon: Instagram, label: "instagram", href: "#" },
  ];

  const quickLinks = [
    { label: "About Us", href: "/about" },
    { label: "Shop", href: "/" },
    { label: "Community", href: "#" },
    { label: "Learn", href: "#" },
    { label: "Partner Stores", href: "#" },
  ];

  const supportLinks = [
    { icon: Mail, label: "Contact Us", href: "/contact" },
    { icon: Phone, label: "FAQ", href: "#" },
    { icon: MapPin, label: "Shipping Info", href: "#" },
    { label: "Returns & Refunds", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ];

  return (
    <footer className="mt-20 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900/50">
      <motion.div
        className="container-app grid md:grid-cols-4 gap-8 py-12"
        variants={staggerContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Brand Section */}
        <motion.div variants={staggerItemVariants}>
          <h4 className="font-bold text-xl text-gray-900 dark:text-white">
            ShopHub
          </h4>
          <p className="text-sm mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
            A clean marketplace experience that connects shoppers with trusted
            partner stores.
          </p>

          {/* Social Links */}
          <div className="flex gap-3 mt-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <Icon size={16} />
                </motion.a>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div variants={staggerItemVariants}>
          <h5 className="font-semibold text-gray-900 dark:text-white mb-4">
            Quick Links
          </h5>
          <ul className="space-y-2.5">
            {quickLinks.map((link, idx) => (
              <motion.li
                key={link.label}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
              >
                <a
                  href={link.href}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {link.label}
                </a>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Featured Categories */}
        <motion.div variants={staggerItemVariants}>
          <h5 className="font-semibold text-gray-900 dark:text-white mb-4">
            Featured Categories
          </h5>
          <div className="space-y-2.5">
            {[{ name: "Electronics", path: "electronics" }].map((cat, idx) => (
              <motion.a
                key={cat.path}
                href={`/category/${cat.path}`}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <div className="w-6 h-6 rounded bg-gradient-to-br from-primary-400 to-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {cat.name}
                </span>
              </motion.a>
            ))}
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
              Curated collections for everyday shopping
            </p>
          </div>
        </motion.div>

        {/* Support */}
        <motion.div variants={staggerItemVariants}>
          <h5 className="font-semibold text-gray-900 dark:text-white mb-4">
            Support
          </h5>
          <ul className="space-y-2.5">
            {supportLinks.map((link, idx) => (
              <motion.li
                key={link.label}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
              >
                <a
                  href={link.href}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {link.icon && <link.icon size={14} />}
                  {link.label}
                </a>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      {/* Bottom Section */}
      <motion.div
        className="border-t border-gray-200 dark:border-gray-800"
        variants={fadeInUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container-app py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Contact Info
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Brussels, Belgium • +32 2 123 4567 • info@shophub.example.com
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} ShopHub. All rights reserved.
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
