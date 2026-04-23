export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="aspect-square w-full animate-pulse rounded-2xl bg-secondary" />
      <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-secondary" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-secondary" />
    </div>
  );
}
