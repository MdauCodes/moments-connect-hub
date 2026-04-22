import { ShoppingBag } from "lucide-react";
import { useBasket } from "@/contexts/BasketContext";

interface BasketPillProps {
  onOpen: () => void;
}

export function BasketPill({ onOpen }: BasketPillProps) {
  const { count } = useBasket();

  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={onOpen}
      // Sits above the WhatsApp float on mobile, beside it on larger screens
      className="fixed bottom-24 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl sm:bottom-6 sm:right-6 sm:px-5 sm:py-3 sm:text-sm md:right-44"
      aria-label="Open enquiry basket"
    >
      <ShoppingBag className="h-4 w-4" />
      <span>
        {count} <span className="hidden sm:inline">product{count !== 1 ? "s" : ""} </span>selected
      </span>
    </button>
  );
}
