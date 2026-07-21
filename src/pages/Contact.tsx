import { Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_transparent_45%),linear-gradient(180deg,_#faf7f2_0%,_#f5efe7_100%)] dark:bg-gray-900">
      <div className="container-app py-16">
        <div className="rounded-[32px] border border-stone-200 bg-white/80 p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] dark:border-neutral-700 dark:bg-neutral-800/80">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">
            Support
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-900 dark:text-white">
            Contact Us
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600 dark:text-stone-400">
            Whether you need help with an order, a partnership inquiry, or
            product guidance, our team is here to help. We prioritise fast
            responses during business hours and provide clear guidance for
            delivery, pickup and payments.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-[24px] border border-stone-200 bg-stone-50/80 p-6 dark:border-neutral-700 dark:bg-neutral-900/30">
              <h2 className="mb-3 font-semibold text-stone-900 dark:text-white">
                Get in touch
              </h2>
              <p className="text-sm leading-7 text-stone-600 dark:text-stone-300">
                For general support, email{" "}
                <strong>support@shophub.example.com</strong>. For urgent order
                issues call <strong>+250 788 243 550</strong>.
              </p>

              <div className="mt-4 space-y-3 text-sm text-stone-600 dark:text-stone-300">
                <div className="flex items-center gap-2">
                  <MapPin size={16} /> Kigali, Rwanda
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} /> +250 788 243 550
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} /> support@shophub.example.com
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-stone-200 bg-stone-50/80 p-6 dark:border-neutral-700 dark:bg-neutral-900/30">
              <h2 className="mb-3 font-semibold text-stone-900 dark:text-white">
                Business & Partnerships
              </h2>
              <p className="text-sm leading-7 text-stone-600 dark:text-stone-300">
                Interested in partnering? Email{" "}
                <strong>partners@shophub.example.com</strong> with a short
                description of your store and product catalogue. We aim to
                respond within 2 business days and will guide you through our
                onboarding process.
              </p>

              <div className="mt-4 text-sm text-stone-600 dark:text-stone-300">
                <p>
                  Owners: <strong>IGIRUBUNTU Eddy Gershom</strong> &amp;{" "}
                  <strong>NIYIKIZA Theonest</strong> — for strategic or media
                  inquiries contact <strong>owners@shophub.example.com</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
