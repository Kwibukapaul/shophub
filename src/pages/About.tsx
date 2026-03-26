export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          About ShopHub
        </h1>

        <p className="text-gray-700 dark:text-gray-300 mb-4">
          ShopHub is a marketplace built to connect customers with quality
          partner stores across electronics, fashion and home goods. Our mission
          is to make shopping simple, reliable and locally relevant.
        </p>

        <h2 className="font-semibold mt-6 mb-2">Our Story</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Founded by three entrepreneurs, ShopHub started as a small idea to
          bring curated products online with a strong partner network. We focus
          on trust, transparency and good service.
        </p>

        <h2 className="font-semibold mt-6 mb-2">Founders</h2>
        <ul className="text-gray-700 dark:text-gray-300">
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
  );
}
