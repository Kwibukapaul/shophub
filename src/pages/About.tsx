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
            ShopHub is a marketplace built to connect customers with quality
            partner stores across electronics, fashion, and home goods. Our
            mission is to make shopping simple, reliable, and locally relevant.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-[24px] border border-stone-200 bg-stone-50/80 p-6 dark:border-neutral-700 dark:bg-neutral-900/30">
              <h2 className="mb-2 font-semibold text-stone-900 dark:text-white">
                Our Story
              </h2>
              <p className="text-sm leading-7 text-stone-700 dark:text-stone-300">
                Founded by three entrepreneurs, ShopHub started as a small idea
                to bring curated products online with a strong partner network.
                We focus on trust, transparency, and good service.
              </p>
            </div>
            <div className="rounded-[24px] border border-stone-200 bg-stone-50/80 p-6 dark:border-neutral-700 dark:bg-neutral-900/30">
              <h2 className="mb-2 font-semibold text-stone-900 dark:text-white">
                Founders
              </h2>
              <ul className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
                <li>
                  <strong>Alex Johnson</strong> — CEO
                </li>
                <li>
                  <strong>Priya Singh</strong> — COO
                </li>
                <li>
                  <strong>Daniel Mwangi</strong> — CTO
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
