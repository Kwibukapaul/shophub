export default function About() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_transparent_45%),linear-gradient(180deg,_#faf7f2_0%,_#f5efe7_100%)] dark:bg-gray-900">
      <div className="container-app py-16">
        <div className="rounded-[32px] border border-stone-200 bg-white/80 p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] dark:border-neutral-700 dark:bg-neutral-800/80">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">
            About
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-900 dark:text-white">
            About ShopHub
          </h1>

          <p className="mt-4 text-base leading-8 text-stone-700 dark:text-stone-300">
            ShopHub is a hybrid e-commerce platform built to connect Kigali
            customers with quality products from both the Platform's own
            inventory and carefully selected partner stores. We launched with a
            focus on electronics and accessories and will expand into new
            categories such as Made-in-Rwanda items and fashion as demand grows.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-[24px] border border-stone-200 bg-stone-50/80 p-6 dark:border-neutral-700 dark:bg-neutral-900/30">
              <h2 className="mb-2 font-semibold text-stone-900 dark:text-white">
                Vision & Mission
              </h2>
              <p className="text-sm leading-7 text-stone-700 dark:text-stone-300">
                <strong>Vision:</strong> Become a leading digital commerce
                platform that connects people with quality products and trusted
                retailers.
              </p>
              <p className="mt-2 text-sm leading-7 text-stone-700 dark:text-stone-300">
                <strong>Mission:</strong> Provide a seamless, reliable, and
                accessible shopping experience that empowers customers and
                supports local businesses.
              </p>
            </div>

            <div className="rounded-[24px] border border-stone-200 bg-stone-50/80 p-6 dark:border-neutral-700 dark:bg-neutral-900/30">
              <h2 className="mb-2 font-semibold text-stone-900 dark:text-white">
                Founders & Owners
              </h2>
              <ul className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
                <li>
                  <strong>IGIRUBUNTU Eddy Gershom</strong> — Co-owner
                </li>
                <li>
                  <strong>NIYIKIZA Theonest</strong> — Co-owner
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="mb-2 font-semibold text-stone-900 dark:text-white">
              What we do
            </h2>
            <ul className="list-inside list-disc space-y-2 text-sm text-stone-700 dark:text-stone-300">
              <li>
                Unify Platform and partner inventories into a single catalog.
              </li>
              <li>
                Offer local payment methods (Mobile Money / MoMo) and delivery
                or pickup options within Kigali.
              </li>
              <li>
                Provide an internal dashboard for product, order and partner
                management.
              </li>
            </ul>

            <p className="mt-4 text-sm text-stone-600 dark:text-stone-400">
              Pilot timeline: Dec 12, 2025 — Feb 1, 2026. Our initial goals are
              to validate customer adoption, process orders reliably, and
              onboard partner stores with strong operational workflows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
