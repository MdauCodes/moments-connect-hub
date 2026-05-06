import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { InlineProgress } from "@/components/InlineProgress";
import { useEffect, useRef, useState } from "react";
import { Smartphone, Clock } from "lucide-react";
import { z } from "zod";
import { SiteLayout } from "@/components/SiteLayout";
import { orderStore, type CustomerOrder } from "@/services/orderStore";

const searchSchema = z.object({
  ref: z.string(),
  orderId: z.string().optional(),
  paymentMethod: z.string().optional(),
  phone: z.string().optional(),
});

export const Route = createFileRoute("/checkout/processing")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Processing payment — Moments Packaging" }, { name: "robots", content: "noindex" }] }),
  component: ProcessingPage,
});

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 10;

function ProcessingPage() {
  const { ref, orderId: orderIdParam, paymentMethod, phone } = Route.useSearch();
  const navigate = useNavigate();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    (async () => {
      // Look up the order to get its id + actual paymentMethod if not in URL.
      const { order: o } = await orderStore.getStatus(ref);
      if (cancelled) return;
      setOrder(o);
      const orderId = orderIdParam ?? o?.id ?? ref;
      const method = (paymentMethod ?? o?.paymentMethod ?? "PAYHERO").toUpperCase();

      // Non-online methods skip payment initiation.
      if (method === "CASH_ON_DELIVERY" || method === "BANK_TRANSFER") {
        navigate({ to: "/checkout/success", search: { ref } });
        return;
      }

      // Initiate PayHero (M-Pesa STK) payment.
      if (method === "PAYHERO" || method === "MPESA") {
        const phoneToUse = phone ?? o?.customerPhone ?? "";
        const init = await orderStore.initiatePayment(orderId, phoneToUse, "PAYHERO");
        if (cancelled) return;
        if (!init.ok) {
          setInitError(init.message ?? "Could not start payment");
          navigate({
            to: "/checkout/failed",
            search: { ref, reason: init.message ?? "initiate_failed" },
          });
          return;
        }
      }

      // Poll status every POLL_INTERVAL_MS, max MAX_ATTEMPTS.
      let n = 0;
      const poll = async () => {
        if (cancelled) return;
        n += 1;
        setAttempt(n);
        const res = await orderStore.getPaymentStatus(orderId);
        if (cancelled) return;

        if (res.status === "SUCCESS") {
          navigate({ to: "/checkout/success", search: { ref } });
          return;
        }
        if (res.status === "FAILED") {
          navigate({
            to: "/checkout/failed",
            search: { ref, reason: res.message ?? "payment_failed" },
          });
          return;
        }
        if (n >= MAX_ATTEMPTS) {
          setTimedOut(true);
          return;
        }
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      };
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    })();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [ref, orderIdParam, paymentMethod, phone, navigate]);

  if (timedOut) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-2xl px-5 py-20 text-center lg:px-8 lg:py-28">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Clock className="h-7 w-7 text-foreground/70" />
          </div>
          <h1 className="mt-6 font-display text-3xl sm:text-4xl">Payment pending</h1>
          <p className="mt-3 text-muted-foreground">
            We didn't get a confirmation in time for order
            <span className="font-semibold text-foreground"> {ref}</span>.
            Check your orders for the latest status — if you completed the M-Pesa prompt, it usually clears within a few minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/orders/track"
              search={{ ref }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Track this order
            </Link>
            <Link
              to="/account/orders"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm hover:bg-secondary"
            >
              My orders
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-2xl px-5 py-20 text-center lg:px-8 lg:py-28">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <Smartphone className="h-7 w-7 text-accent" />
        </div>
        <h1 className="mt-6 font-display text-3xl sm:text-4xl">Check your phone for M-Pesa prompt</h1>
        <p className="mt-3 text-muted-foreground">
          We've sent an STK push for order
          <span className="font-semibold text-foreground"> {ref}</span>.
          Enter your M-Pesa PIN on your phone to confirm payment.
        </p>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-secondary/60 px-4 py-2 text-sm text-foreground/80">
          <InlineProgress size="sm" />
          Waiting for confirmation… (attempt {attempt}/{MAX_ATTEMPTS})
        </div>

        {order && (
          <p className="mt-6 text-xs text-muted-foreground">
            Status: <b className="text-foreground">{order.paymentStatus}</b>
          </p>
        )}

        {initError && (
          <p className="mt-4 text-xs text-destructive">{initError}</p>
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
