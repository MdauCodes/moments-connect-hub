import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiUrl } from "@/config/api";

export interface SiteConfig {
  blogsEnabled: boolean;
  emailCaptureEnabled: boolean;
  whatsappNumber: string;
  companyEmail: string;
  companyPhone: string;
}

const DEFAULTS: SiteConfig = {
  blogsEnabled: true,
  emailCaptureEnabled: true,
  whatsappNumber: "254119556688",
  companyEmail: "sales@momentspackaging.co.ke",
  companyPhone: "0119 556 688",
};

const SiteConfigContext = createContext<SiteConfig>(DEFAULTS);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(DEFAULTS);

  useEffect(() => {
    let cancelled = false;
    fetch(apiUrl("/api/v1/public/config"))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setConfig({
          blogsEnabled: data.blogsEnabled ?? DEFAULTS.blogsEnabled,
          emailCaptureEnabled: data.emailCaptureEnabled ?? DEFAULTS.emailCaptureEnabled,
          whatsappNumber: data.whatsappNumber ?? DEFAULTS.whatsappNumber,
          companyEmail: data.companyEmail ?? DEFAULTS.companyEmail,
          companyPhone: data.companyPhone ?? DEFAULTS.companyPhone,
        });
      })
      .catch(() => {
        // silent — keep defaults
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <SiteConfigContext.Provider value={config}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
