import { createFileRoute, Link } from "@tanstack/react-router";
import { COMPANY_EMAIL, COMPANY_PHONE } from "@/data/products";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Moments Packaging Kenya" },
      {
        name: "description",
        content:
          "The terms that govern quotes, orders, payment, production, delivery and returns for custom-branded paper packaging from Moments Packaging Kenya.",
      },
      { property: "og:title", content: "Terms of Service — Moments Packaging Kenya" },
      {
        property: "og:description",
        content:
          "The terms that govern quotes, orders, payment, production, delivery and returns for custom-branded paper packaging from Moments Packaging Kenya.",
      },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const updated = "May 18, 2026";
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16 lg:px-8">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Legal</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight sm:text-5xl">Terms of Service</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: {updated}</p>

      <div className="prose prose-neutral mt-8 max-w-none text-foreground/90">
        <p>
          These Terms govern your use of <strong>momentspackaging.com</strong> and the purchase of
          custom-branded paper packaging from Moments Packaging Kenya Ltd
          (&ldquo;Moments Packaging&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By placing an order or
          using the site, you agree to these Terms.
        </p>

        <h2>1. Who we are</h2>
        <p>
          Moments Packaging Kenya Ltd is a Kenyan-registered business based in Industrial Area,
          Nairobi. We design, print and deliver custom paper packaging — bags, boxes, wraps and
          related products — to restaurants, retailers and brands across Kenya.
        </p>

        <h2>2. Quotes &amp; orders</h2>
        <ul>
          <li>
            Catalogue prices on the site apply to standard stock and standard print. Custom
            artwork, custom sizes or rush turnarounds may be quoted separately.
          </li>
          <li>
            A quote is valid for 14 days unless stated otherwise. Prices may change after that due
            to paper or print-cost movements.
          </li>
          <li>
            An order is only confirmed once we receive payment (or the agreed deposit) and you have
            approved the final artwork proof.
          </li>
        </ul>

        <h2>3. Pricing &amp; payment</h2>
        <ul>
          <li>All prices are in Kenya Shillings (KES) and, where stated, include VAT.</li>
          <li>
            We accept M-Pesa, bank transfer, and (for select customers) cash on delivery. For large
            or enterprise orders we may require a 50% deposit before production starts.
          </li>
          <li>
            M-Pesa payments are processed via Safaricom. You are responsible for entering the
            correct M-Pesa number and confirming the STK push.
          </li>
        </ul>

        <h2>4. Artwork approval</h2>
        <ul>
          <li>
            You are responsible for the accuracy of artwork, spelling, logos and colours you supply.
          </li>
          <li>
            We will send a digital proof for your approval before printing. Once you approve the
            proof in writing (email or WhatsApp), the print run will go ahead as approved.
          </li>
          <li>
            Colours on screen are approximate. Printed colours can vary slightly between batches
            and paper stocks — this is normal in commercial printing and is not a defect.
          </li>
          <li>
            You confirm you own or are licensed to use any logos, trademarks or images you supply.
            We are not liable for third-party IP infringement caused by artwork you provide.
          </li>
        </ul>

        <h2>5. Production &amp; lead times</h2>
        <p>
          Lead times shown on a product page are estimates from the date of artwork approval and
          payment. Lead times may be longer for very large orders, complex finishes, or during peak
          seasons. We will keep you updated on WhatsApp or email.
        </p>

        <h2>6. Delivery, pickup &amp; own courier</h2>
        <ul>
          <li>
            <strong>Zone delivery:</strong> we deliver within our published delivery zones at the
            rate shown at checkout.
          </li>
          <li>
            <strong>Pickup:</strong> you can collect free of charge from our shop in Industrial
            Area, Nairobi during business hours. We will WhatsApp you when the order is ready.
          </li>
          <li>
            <strong>Own courier (Matatu, parcel service, etc.):</strong> when you choose this
            option, our team will call you at dispatch to confirm the transport cost. You may pay
            that cost directly to the courier or settle it with us. Once goods leave our premises
            with your nominated courier, risk passes to you.
          </li>
          <li>Please inspect goods on receipt and report any visible damage within 24 hours.</li>
        </ul>

        <h2>7. Returns, refunds &amp; reprints</h2>
        <ul>
          <li>
            Custom-printed products are made specifically for you and cannot be returned for a
            change of mind.
          </li>
          <li>
            If a product is defective or differs materially from the approved proof, contact us
            within 7 days of delivery. We will reprint or refund at our discretion after reviewing
            the issue.
          </li>
          <li>
            We are not responsible for losses caused by errors in artwork you approved, or by
            third-party couriers you chose.
          </li>
        </ul>

        <h2>8. Cancellations</h2>
        <p>
          You can cancel an order at no cost before artwork is approved and production starts.
          Once production has started, cancellation may incur charges for materials, plates and
          labour already used.
        </p>

        <h2>9. Accounts</h2>
        <p>
          You are responsible for keeping your account password confidential and for all activity
          under your account. Notify us immediately at <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a>
          {" "}if you suspect unauthorised access.
        </p>

        <h2>10. Acceptable use</h2>
        <p>
          You agree not to misuse the site (for example: hacking, scraping at abusive rates,
          uploading malware, or submitting artwork that is unlawful, defamatory or infringes
          third-party rights).
        </p>

        <h2>11. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by Kenyan law, our total liability for any claim
          relating to an order is limited to the amount you paid for that order. We are not liable
          for indirect or consequential losses such as lost profits or lost business opportunities.
        </p>

        <h2>12. Governing law</h2>
        <p>
          These Terms are governed by the laws of Kenya. Any dispute will be subject to the
          exclusive jurisdiction of the courts of Kenya, sitting in Nairobi.
        </p>

        <h2>13. Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. The version in force is the one published
          on this page at the time you place your order.
        </p>

        <h2>14. Contact</h2>
        <p>
          Moments Packaging Kenya Ltd<br />
          Industrial Area, Nairobi, Kenya<br />
          Email: <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a><br />
          Phone / WhatsApp: <a href={`tel:${COMPANY_PHONE.replace(/\s/g, "")}`}>{COMPANY_PHONE}</a>
        </p>

        <p className="mt-10 text-sm">
          See also our <Link to="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}
