import { createFileRoute, Link } from "@tanstack/react-router";
import { COMPANY_EMAIL, COMPANY_PHONE } from "@/data/products";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Moments Packaging Kenya" },
      {
        name: "description",
        content:
          "How Moments Packaging Kenya collects, uses and protects your personal information when you order custom paper packaging.",
      },
      { property: "og:title", content: "Privacy Policy — Moments Packaging Kenya" },
      {
        property: "og:description",
        content:
          "How Moments Packaging Kenya collects, uses and protects your personal information when you order custom paper packaging.",
      },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const updated = "May 18, 2026";
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16 lg:px-8">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Legal</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: {updated}</p>

      <div className="prose prose-neutral mt-8 max-w-none text-foreground/90">
        <p>
          Moments Packaging Kenya Ltd (&ldquo;Moments Packaging&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your
          privacy. This policy explains what personal information we collect when you use{" "}
          <strong>momentspackaging.com</strong> or order custom-branded paper packaging from us,
          how we use it, and the choices you have. We comply with Kenya&apos;s Data Protection Act,
          2019.
        </p>

        <h2>1. Information we collect</h2>
        <ul>
          <li>
            <strong>Account &amp; order details:</strong> name, business name, email, phone number,
            delivery address, county and order history.
          </li>
          <li>
            <strong>Payment information:</strong> M-Pesa phone number and transaction references.
            We do not store full card numbers — payments are processed by our payment partners
            (Safaricom M-Pesa, bank transfer).
          </li>
          <li>
            <strong>Artwork &amp; branding files</strong> you upload for printing.
          </li>
          <li>
            <strong>Usage data:</strong> pages visited, device type, approximate location and
            referrer, collected via cookies and analytics.
          </li>
          <li>
            <strong>Communications:</strong> WhatsApp, email and call records with our sales team.
          </li>
        </ul>

        <h2>2. How we use your information</h2>
        <ul>
          <li>Process quotes, orders, M-Pesa payments, dispatch and delivery.</li>
          <li>Produce your custom-printed packaging based on the artwork you provide.</li>
          <li>Send order confirmations, dispatch updates and delivery notifications.</li>
          <li>Provide customer support over WhatsApp, phone and email.</li>
          <li>Improve our website, catalogue and pricing tiers.</li>
          <li>
            Send marketing about new products, deals and bulk-order offers — only where you have
            opted in. You can unsubscribe at any time.
          </li>
          <li>Comply with KRA, accounting and other legal obligations.</li>
        </ul>

        <h2>3. Sharing your information</h2>
        <p>We share personal information only with:</p>
        <ul>
          <li>Our delivery partners and own courier riders, strictly to fulfil your order.</li>
          <li>Safaricom (M-Pesa) and our banks, to process payments.</li>
          <li>Hosting, email and analytics providers acting on our instructions.</li>
          <li>Regulators or law enforcement where we are legally required to do so.</li>
        </ul>
        <p>We never sell your personal information.</p>

        <h2>4. Artwork &amp; intellectual property</h2>
        <p>
          Logos and artwork you upload remain your property. We use them only to produce the order
          you placed. We may keep a copy on file so repeat orders are faster — tell us in writing
          if you want it deleted.
        </p>

        <h2>5. Cookies</h2>
        <p>
          We use essential cookies to keep you signed in and remember your cart, plus analytics
          cookies to understand how the site is used. You can disable cookies in your browser, but
          parts of the checkout may stop working.
        </p>

        <h2>6. Data retention</h2>
        <p>
          We keep order, invoice and payment records for at least 7 years, as required by Kenyan
          tax law. Marketing data is kept until you unsubscribe.
        </p>

        <h2>7. Security</h2>
        <p>
          Data is transmitted over HTTPS and stored with reputable cloud providers. Access is
          limited to staff who need it. No system is 100% secure — please use a strong, unique
          password for your account.
        </p>

        <h2>8. Your rights</h2>
        <p>Under the Data Protection Act, 2019 you have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you.</li>
          <li>Request correction or deletion.</li>
          <li>Object to marketing.</li>
          <li>Lodge a complaint with the Office of the Data Protection Commissioner (ODPC).</li>
        </ul>
        <p>
          To exercise any of these rights, email <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a>
          {" "}or call <a href={`tel:${COMPANY_PHONE.replace(/\s/g, "")}`}>{COMPANY_PHONE}</a>.
        </p>

        <h2>9. Children</h2>
        <p>Our service is intended for businesses and adults. We do not knowingly collect data from children under 18.</p>

        <h2>10. Changes to this policy</h2>
        <p>
          We may update this policy from time to time. The &ldquo;Last updated&rdquo; date above will
          reflect the latest version. Material changes will be notified by email or a notice on the
          site.
        </p>

        <h2>11. Contact us</h2>
        <p>
          Moments Packaging Kenya Ltd<br />
          Industrial Area, Nairobi, Kenya<br />
          Email: <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a><br />
          Phone / WhatsApp: <a href={`tel:${COMPANY_PHONE.replace(/\s/g, "")}`}>{COMPANY_PHONE}</a>
        </p>

        <p className="mt-10 text-sm">
          See also our <Link to="/terms" className="underline">Terms of Service</Link>.
        </p>
      </div>
    </main>
  );
}
