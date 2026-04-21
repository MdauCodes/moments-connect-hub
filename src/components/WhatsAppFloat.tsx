import { whatsappLink } from "@/data/products";
import { MessageCircle } from "lucide-react";

export function WhatsAppFloat() {
  const href = whatsappLink("Hi Moments Packaging, I'd like to enquire about your packaging.");
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 bg-[#25D366] px-5 py-3.5 text-sm font-medium text-white shadow-lg shadow-foreground/15 transition-transform hover:scale-105"
    >
      <MessageCircle className="h-4 w-4" />
      <span className="hidden sm:inline">Chat on WhatsApp</span>
    </a>
  );
}
