import { Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-app py-16">
        <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
          Contact Us
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="card p-6">
            <h2 className="font-semibold mb-2">Get in touch</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              For support or business inquiries, email us at{" "}
              <strong>support@shophub.example.com</strong> or call{" "}
              <strong>+250 788 123 456</strong>.
            </p>

            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin size={16} /> 123 Market Street, Kigali, Rwanda
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} /> +250 788 123 456
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} /> support@shophub.example.com
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold mb-2">Business & Partnerships</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Interested in partnering with us? Contact our partnerships team at{" "}
              <strong>partners@shophub.example.com</strong>. We typically
              respond within 2 business days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
