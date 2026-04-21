import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import {
  COMPANY_ADDRESS,
  COMPANY_EMAIL,
  COMPANY_PHONE,
  whatsappLink,
} from "@/data/products";
import { Check, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Request a Quote — Moments Packaging Kenya" },
      {
        name: "description",
        content:
          "Tell us about your packaging needs — food or non-food. Get a tailored quote within 24 hours from the Moments Packaging sales team in Nairobi.",
      },
      { property: "og:title", content: "Request a Quote — Moments Packaging Kenya" },
      {
        property: "og:description",
        content:
          "Custom packaging quote — answered within 24 hours by our Nairobi team. Or chat with us instantly on WhatsApp.",
      },
    ],
  }),
  component: ContactPage,
});

const formSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name").max(100),
  company: z.string().trim().max(100).optional(),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  division: z.enum(["food", "retail-industrial", "both"]),
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
    // PRODUCTION: POST to Spring Boot /api/enquiries -> triggers Resend email
    setSubmitted(true);
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Request a quote
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-5xl font-medium leading-[1.05] text-foreground text-balance sm:text-6xl lg:text-7xl">
            Tell us what you need to pack.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Food packaging, retail packaging, or both — fill in the form and our sales team will
            respond within 24 hours with sizing, MOQ and pricing options. Prefer WhatsApp? Tap
            the button below.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:grid lg:grid-cols-12 lg:gap-12 lg:px-8">
        <div className="lg:col-span-7">
          {submitted ? (
            <div className="border border-border bg-cream p-10 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center bg-foreground text-background">
                <Check className="h-7 w-7" />
              </div>
              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Quote request received
              </p>
              <h2 className="mt-3 font-display text-3xl text-foreground">
                Thanks — we'll be in touch within 24 hours.
              </h2>
              <p className="mt-4 text-sm text-muted-foreground">
                A confirmation has been sent to your email. If urgent, message us on WhatsApp.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-8 inline-flex border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-secondary"
              >
                Submit another enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="border border-border bg-background p-6 sm:p-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Quote form / Section 01
              </p>
              <h2 className="mt-2 font-display text-2xl text-foreground">Your details</h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Full name *" name="fullName" error={errors.fullName} />
                <Field label="Company name" name="company" error={errors.company} />
                <Field label="Email *" name="email" type="email" error={errors.email} />
                <Field label="Phone / WhatsApp *" name="phone" type="tel" placeholder="+254 …" error={errors.phone} />
              </div>

              <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Quote form / Section 02
              </p>
              <h2 className="mt-2 font-display text-2xl text-foreground">What you need to pack</h2>

              <div className="mt-6">
                <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Which division do you need? *
                </label>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {[
                    { v: "food", l: "Food Service" },
                    { v: "retail-industrial", l: "Retail & Industrial" },
                    { v: "both", l: "Both / Not sure" },
                  ].map((opt, i) => (
                    <label
                      key={opt.v}
                      className="flex cursor-pointer items-center gap-3 border border-border bg-background px-4 py-3 text-sm has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background"
                    >
                      <input
                        type="radio"
                        name="division"
                        value={opt.v}
                        defaultChecked={i === 0}
                        className="sr-only"
                      />
                      {opt.l}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field
                  label="Product interest *"
                  name="productInterest"
                  placeholder="e.g. Branded coffee cups + carrier bags"
                  error={errors.productInterest}
                />
                <Field
                  label="Estimated quantity *"
                  name="quantity"
                  placeholder="e.g. 5,000 units / month"
                  error={errors.quantity}
                />
              </div>

              <div className="mt-5">
                <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Anything else? (optional)
                </label>
                <textarea
                  name="message"
                  rows={5}
                  maxLength={1000}
                  className="mt-2 block w-full resize-none border border-input bg-background px-4 py-3 text-sm focus:border-foreground focus:outline-none"
                  placeholder="Sizes, branding details, deadlines…"
                />
              </div>

              <button
                type="submit"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 bg-primary px-6 py-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
              >
                Send quote request
              </button>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                We respond within 24 hours · Mon–Sat
              </p>
            </form>
          )}
        </div>

        <aside className="mt-10 lg:col-span-5 lg:mt-0">
          <div className="bg-foreground p-8 text-background lg:p-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-background/55">
              Faster path
            </p>
            <h3 className="mt-3 font-display text-2xl">Prefer to chat?</h3>
            <p className="mt-3 text-sm text-background/75">
              Message us instantly on WhatsApp. Best for SMEs, reorders and quick questions.
            </p>
            <a
              href={whatsappLink("Hi Moments Packaging, I'd like to enquire about packaging.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 bg-[#25D366] px-6 py-3.5 text-sm font-medium text-white"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp us now
            </a>
          </div>

          <div className="mt-px border border-border bg-background p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Or reach us directly
            </p>
            <ul className="mt-5 space-y-5">
              <ContactRow icon={Phone} label="Call" value={COMPANY_PHONE} />
              <ContactRow icon={Mail} label="Email" value={COMPANY_EMAIL} />
              <ContactRow icon={MapPin} label="Visit" value={`${COMPANY_ADDRESS} · Mon–Sat 8am–5pm`} />
            </ul>
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
      <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        maxLength={255}
        className={`mt-2 block w-full border bg-background px-4 py-3 text-sm focus:outline-none ${
          error ? "border-destructive" : "border-input focus:border-foreground"
        }`}
      />
      {error && <p className="mt-1.5 font-mono text-[10px] text-destructive">{error}</p>}
    </div>
  );
}

function ContactRow({
  icon: Icon, label, value,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <li className="flex items-start gap-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center border border-border text-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-sm text-foreground">{value}</p>
      </div>
    </li>
  );
}
