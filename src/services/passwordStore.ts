// ----------------------------------------------------------------------------
// Password reset & email verification — mock-live hybrid.
// Live endpoints (assumed):
//   POST /api/v1/auth/forgot-password { email }
//   POST /api/v1/auth/reset-password  { token, password }
//   POST /api/v1/auth/verify          { token }
// In mock mode, "tokens" are simply non-empty strings; flows always succeed.
// ----------------------------------------------------------------------------
import { apiUrl } from "@/config/api";

async function postOrMock(path: string, body: unknown): Promise<{ ok: boolean; source: "live" | "mock"; message?: string }> {
  try {
    const res = await fetch(apiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return { ok: true, source: "live" };
    const data = await res.json().catch(() => ({}));
    return { ok: false, source: "live", message: (data as { message?: string }).message ?? "Request failed" };
  } catch {
    // No backend — simulate success
    await new Promise((r) => setTimeout(r, 600));
    return { ok: true, source: "mock" };
  }
}

export const passwordStore = {
  async requestReset(email: string) {
    return postOrMock("/api/v1/auth/forgot-password", { email });
  },
  async reset(token: string, password: string) {
    if (!token) return { ok: false, source: "mock" as const, message: "Reset link is invalid or has expired." };
    return postOrMock("/api/v1/auth/reset-password", { token, password });
  },
  async verifyEmail(token: string) {
    if (!token) return { ok: false, source: "mock" as const, message: "Verification link is invalid." };
    return postOrMock("/api/v1/auth/verify", { token });
  },
};
