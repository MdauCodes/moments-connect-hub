import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">Error 404</p>
        <h1 className="mt-4 font-display text-7xl font-medium text-foreground">Not found</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

// Inline SVG favicon — kraft-tone "M" mark on cream square.
const faviconHref =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#3F5340"/><text x="32" y="44" text-anchor="middle" font-family="Georgia,serif" font-size="38" font-weight="600" fill="#F4ECD8">m</text></svg>`,
  );

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Moments Packaging Kenya — Food, Retail & Industrial Packaging" },
      {
        name: "description",
        content:
          "A Nairobi-based packaging manufacturer serving Kenya's food service, retail, gifting, e-commerce and agricultural sectors. Custom branding, low MOQ, nationwide delivery.",
      },
      { name: "author", content: "Moments Packaging Kenya Ltd." },
      { name: "theme-color", content: "#3F5340" },
      { property: "og:site_name", content: "Moments Packaging Kenya" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_KE" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: faviconHref },
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
  return <Outlet />;
}
