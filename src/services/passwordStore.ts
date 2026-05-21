// ----------------------------------------------------------------------------
// Password reset & email verification — wired to the Spring Boot backend.
//   POST /api/v1/auth/forgot-password { email }
//   POST /api/v1/auth/reset-password  { token, password }
//   POST /api/v1/auth/verify-email    { token }
// ----------------------------------------------------------------------------
import { apiUrl } from "@/config/api";

type Result = { ok: boolean; message?: string };

async function post(path: string, body: unknown): Promise<Result> {
  try {
    const res = await fetch(apiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return { ok: true };
    const data = await res.json().catch(() => ({}));
    return { ok: false, message: (data as { message?: string }).message ?? `Request failed (${res.status})` };
  } catch {
    return { ok: false, message: "Network error — please check your connection and try again." };
  }
}

export const passwordStore = {
  async requestReset(email: string): Promise<Result> {
    return post("/api/v1/auth/forgot-password", { email });
  },
  async reset(token: string, password: string): Promise<Result> {
    if (!token) return { ok: false, message: "Reset link is invalid or has expired." };
    return post("/api/v1/auth/reset-password", { token, password });
  },
  async verifyEmail(token: string): Promise<Result> {
    if (!token) return { ok: false, message: "Verification link is invalid." };
    return post("/api/v1/auth/verify-email", { token });
  },
};
