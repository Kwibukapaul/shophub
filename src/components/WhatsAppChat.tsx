import { MessageSquare } from "lucide-react";

export default function WhatsAppChat({
  phone = "+250788243550",
}: {
  phone?: string;
}) {
  const normalized = phone.replace(/[^0-9]/g, "");
  const href = `https://wa.me/${normalized}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg transition transform whatsapp-bolt"
      aria-label="Chat on WhatsApp"
    >
      <MessageSquare className="h-5 w-5" />
      <span className="text-sm font-medium">Chat</span>
    </a>
  );
}
