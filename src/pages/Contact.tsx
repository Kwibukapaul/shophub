export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Contact Us
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h2 className="font-semibold mb-2">Get in touch</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              For support or business inquiries, email us at{" "}
              <strong>support@shophub.example.com</strong> or call +1 (555)
              123-4567.
            </p>

            <div className="mt-4">
              <h3 className="font-medium">Office</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                123 Market Street, Kigali, Rwanda
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h2 className="font-semibold mb-2">Business & Partnerships</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
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
