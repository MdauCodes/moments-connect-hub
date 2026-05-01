import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Smartphone } from "lucide-react";
import { z } from "zod";
import { SiteLayout } from "@/components/SiteLayout";
import { orderStore, type CustomerOrder } from "@/services/orderStore";

const searchSchema = z.object({ ref: z.string() });

export const Route = createFileRoute("/checkout/processing")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Processing payment — Moments Packaging" }, { name: "robots", content: "noindex" }] }),
  component: ProcessingPage,
});

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 90_000;

function ProcessingPage() {
  const { ref } = Route.useSearch();
  const navigate = useNavigate();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();

    async function poll() {
      const { order: o } = await orderStore.getStatus(ref);
      if (cancelled) return;
      setOrder(o);
      setElapsed(Date.now() - start);

      if (o?.paymentStatus === "SUCCESS") {
        navigate({ to: "/checkout/success", search: { ref } });
        return;
      }
      if (o?.paymentStatus === "FAILED" || o?.paymentStatus === "CANCELLED") {
        navigate({ to: "/checkout/failed", search: { ref } });
        return;
      }
      if (Date.now() - start > POLL_TIMEOUT_MS) {
        navigate({ to: "/checkout/failed", search: { ref, reason: "timeout" } });
        return;
      }
      setTimeout(poll, POLL_INTERVAL_MS);
    }

    poll();
    return () => { cancelled = true; };
  }, [ref, navigate]);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-2xl px-5 py-20 text-center lg:px-8 lg:py-28">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <Smartphone className="h-7 w-7 text-accent" />
        </div>
        <h1 className="mt-6 font-display text-3xl sm:text-4xl">Check your phone</h1>
        <p className="mt-3 text-muted-foreground">
          We've sent an M-Pesa STK push prompt. Enter your PIN to confirm payment for order
          <span className="font-semibold text-foreground"> {ref}</span>.
        </p>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-secondary/60 px-4 py-2 text-sm text-foreground/80">
          <Loader2 className="h-4 w-4 animate-spin" />
          Waiting for confirmation… ({Math.floor(elapsed / 1000)}s)
        </div>

        {order && (
          <p className="mt-6 text-xs text-muted-foreground">
            Status: <b className="text-foreground">{order.paymentStatus}</b>
          </p>
        )}

        <div className="mt-10 text-xs text-muted-foreground">
          Closed the prompt by mistake?{" "}
          <Link to="/checkout/failed" search={{ ref }} className="text-accent hover:underline">
            Retry payment
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
