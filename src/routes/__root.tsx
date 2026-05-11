import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { PersonaProvider } from "@/contexts/PersonaContext";

import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { SiteConfigProvider } from "@/contexts/SiteConfigContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

const SITE_URL = "https://www.momentspackaging.com";
const SITE_NAME = "Moments Packaging Kenya";
const DEFAULT_TITLE = "Moments Packaging Kenya — Custom Branded Paper Packaging | Nairobi";
const DEFAULT_DESCRIPTION =
  "Moments Packaging Kenya Ltd manufactures custom-branded paper bags, food boxes, cups, mailers, labels and gifting packaging in Nairobi. Low MOQ from 100 units, fast turnaround, nationwide delivery across Kenya.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Moments Packaging Kenya Ltd",
  alternateName: "Moments Packaging (K) Limited",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.png`,
  description: DEFAULT_DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Ukwala Road, opposite Salvation Army, OTC",
    addressLocality: "Nairobi",
    addressCountry: "KE",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+254-119-556688",
      contactType: "sales",
      areaServed: "KE",
      availableLanguage: ["en", "sw"],
    },
    {
      "@type": "ContactPoint",
      telephone: "+254-119-556699",
      contactType: "customer service",
      areaServed: "KE",
      availableLanguage: ["en", "sw"],
    },
  ],
  sameAs: [],
};

const LOCAL_BUSINESS_JSONLD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#business`,
  name: "Moments Packaging Kenya Ltd",
  image: `${SITE_URL}/favicon.png`,
  url: SITE_URL,
  telephone: "+254119556688",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Ukwala Road, opposite Salvation Army, OTC",
    addressLocality: "Nairobi",
    addressCountry: "KE",
  },
  areaServed: { "@type": "Country", name: "Kenya" },
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: DEFAULT_TITLE },
      { name: "description", content: DEFAULT_DESCRIPTION },
      {
        name: "keywords",
        content:
          "custom packaging Kenya, paper bags Nairobi, branded food boxes Kenya, kraft bags supplier Kenya, takeaway packaging Nairobi, custom printed cups Kenya, food packaging manufacturer Kenya, restaurant packaging Kenya, eco-friendly packaging Nairobi, Moments Packaging",
      },
      { name: "author", content: "Moments Packaging Kenya Ltd" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { name: "theme-color", content: "#2D5A3D" },
      { name: "geo.region", content: "KE-30" },
      { name: "geo.placename", content: "Nairobi" },
      { name: "geo.position", content: "-1.2864;36.8172" },
      { name: "ICBM", content: "-1.2864, 36.8172" },

      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: DEFAULT_TITLE },
      { property: "og:description", content: DEFAULT_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:locale", content: "en_KE" },

      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: DEFAULT_TITLE },
      { name: "twitter:description", content: DEFAULT_DESCRIPTION },
      { name: "twitter:image", content: DEFAULT_OG_IMAGE },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "canonical", href: SITE_URL },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(ORGANIZATION_JSONLD),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(LOCAL_BUSINESS_JSONLD),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <SiteConfigProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AdminAuthProvider>
              <PersonaProvider>
                <Outlet />
                <Toaster />
              </PersonaProvider>
            </AdminAuthProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </SiteConfigProvider>
  );
}
