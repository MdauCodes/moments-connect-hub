import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { COMPANY_EMAIL, COMPANY_PHONE, whatsappLink } from "@/data/products";
import { Check, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Get a Custom Quote — Moments Packaging Kenya" },
      {
        name: "description",
        content: "Tell us about your packaging needs. Get a tailored quote within 24 hours from the Moments Packaging sales team.",
      },
      { property: "og:title", content: "Get a Custom Quote — Moments Packaging Kenya" },
      { property: "og:description", content: "Request a custom packaging quote — answered within 24 hours by our Nairobi team." },
    ],
  }),
  component: ContactPage,
});

const formSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name").max(100),
  company: z.string().trim().max(100).optional(),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  productInterest: z.string().trim().min(2, "Tell us what you need").max(200),
  quantity: z.string().trim().min(1).max(50),
  message: z.string().trim().max(1000).optional(),
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const result = formSchema.safeParse(data);
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) {
        if (issue.path[0]) errs[String(issue.path[0])] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    // In production: POST to Spring Boot /api/enquiries -> triggers Resend email
    setSubmitted(true);
  }

  return (
    <SiteLayout>
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <p className="text-xs uppercase tracking-[0.25em] text-accent">Get a quote</p>
          <h1 className="mt-3 font-display text-5xl font-medium text-foreground sm:text-6xl lg:text-7xl text-balance">
            Tell us what you need to pack.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Fill in the form and our sales team will respond within 24 hours with sizing, MOQ and
            pricing options. Prefer WhatsApp? Tap below.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-5 lg:gap-16 lg:px-8">
        <div className="lg:col-span-3">
          {submitted ? (
            <div className="rounded-3xl border border-border bg-card p-10 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent/15">
                <Check className="h-8 w-8 text-accent" />
              </div>
              <h2 className="mt-6 font-display text-3xl text-foreground">Quote request received</h2>
              <p className="mt-3 text-muted-foreground">
                Thanks — our sales team will reach out within 24 hours. A confirmation has been sent
                to your email.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-8 inline-flex rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-secondary"
              >
                Submit another enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-6 sm:p-10">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name *" name="fullName" error={errors.fullName} />
                <Field label="Company name" name="company" error={errors.company} />
                <Field label="Email *" name="email" type="email" error={errors.email} />
                <Field label="Phone / WhatsApp *" name="phone" type="tel" placeholder="+254 …" error={errors.phone} />
                <Field label="Product interest *" name="productInterest" placeholder="e.g. Branded coffee cups" error={errors.productInterest} />
                <Field label="Estimated quantity *" name="quantity" placeholder="e.g. 5,000 units / month" error={errors.quantity} />
              </div>
              <div className="mt-5">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Anything else? (optional)
                </label>
                <textarea
                  name="message"
                  rows={5}
                  maxLength={1000}
                  className="mt-2 block w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                  placeholder="Sizes, branding details, deadlines…"
                />
              </div>
              <button
                type="submit"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
              >
                Send quote request
              </button>
              <p className="mt-4 text-xs text-muted-foreground">
                We respond within 24 hours, Mon–Sat.
              </p>
            </form>
          )}
        </div>

        <aside className="lg:col-span-2">
          <div className="rounded-3xl bg-primary p-8 text-primary-foreground">
            <h3 className="font-display text-2xl">Prefer to chat?</h3>
            <p className="mt-2 text-sm text-primary-foreground/75">
              Get an instant reply on WhatsApp. Best for SMEs and reorders.
            </p>
            <a
              href={whatsappLink("Hi Moments Packaging, I'd like to enquire about packaging.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-medium text-white"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp us now
            </a>
          </div>

          <div className="mt-6 space-y-4 rounded-3xl border border-border bg-card p-8">
            <ContactRow icon={Phone} label="Call" value={COMPANY_PHONE} />
            <ContactRow icon={Mail} label="Email" value={COMPANY_EMAIL} />
            <ContactRow icon={MapPin} label="Visit" value="Industrial Area, Nairobi · Mon–Sat 8am–5pm" />
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}

function Field({
  label, name, type = "text", placeholder, error,
}: { label: string; name: string; type?: string; placeholder?: string; error?: string }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        maxLength={255}
        className={`mt-2 block w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 ${
          error ? "border-destructive" : "border-input focus:border-primary"
        }`}
      />
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ContactRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary text-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}
