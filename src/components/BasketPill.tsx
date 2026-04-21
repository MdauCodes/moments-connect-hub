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
      className="fixed bottom-0 right-0 z-50 mb-6 mr-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl"
      aria-label="Open enquiry basket"
    >
      <ShoppingBag className="h-4 w-4" />
      {count} product{count !== 1 ? "s" : ""} selected
    </button>
  );
}
