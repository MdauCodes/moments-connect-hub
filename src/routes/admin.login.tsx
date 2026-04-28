import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type CSSProperties, type FocusEvent, type FormEvent } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export const Route = createFileRoute("/admin/login")({
  validateSearch: (search) => ({
    redirect: typeof search.redirect === "string" && search.redirect.startsWith("/admin/") ? search.redirect : "/admin/enquiries",
  }),
  component: AdminLoginPage,
});

const styles: Record<string, CSSProperties> = {
  root: {
    minHeight: "100vh",
    width: "100%",
    background: "color-mix(in oklch, var(--forest) 16%, var(--background))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    fontFamily: "var(--font-sans)",
    color: "var(--foreground)",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    background: "color-mix(in oklch, var(--card) 92%, var(--forest))",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: "2.5rem",
    boxShadow: "0 24px 70px color-mix(in oklch, var(--forest) 20%, transparent)",
  },
  logoWrap: { display: "flex", justifyContent: "center" },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    background: "var(--primary)",
    color: "var(--kraft)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Georgia, serif",
    fontSize: 16,
    fontWeight: 600,
  },
  heading: {
    fontSize: 20,
    fontWeight: 600,
    color: "var(--foreground)",
    marginTop: 24,
    textAlign: "center",
    fontFamily: "var(--font-display)",
  },
  sub: { fontSize: 12, color: "var(--muted-foreground)", textAlign: "center", marginTop: 4 },
  form: { marginTop: 32, display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--muted-foreground)",
  },
  input: {
    background: "var(--background)",
    border: "1px solid var(--input)",
    borderRadius: 8,
    padding: "10px 14px",
    color: "var(--foreground)",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
  },
  error: { fontSize: 13, color: "var(--destructive)", minHeight: 20 },
  submit: {
    width: "100%",
    background: "var(--primary)",
    color: "var(--primary-foreground)",
    border: "none",
    borderRadius: 10,
    padding: 11,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  submitDisabled: { opacity: 0.6, cursor: "not-allowed" },
};

function AdminLoginPage() {
  const { login, isAuthenticated, isCheckingSession } = useAdminAuth();
  const { redirect } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isCheckingSession && isAuthenticated) {
      window.location.replace(redirect);
    }
  }, [isAuthenticated, isCheckingSession, redirect]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      window.location.replace(redirect);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--primary)";
  };
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--input)";
  };

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logoMark}>m</div>
        </div>
        <h1 style={styles.heading}>Admin login</h1>
        <p style={styles.sub}>Moments Packaging internal dashboard</p>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@momentspackaging.com"
              style={styles.input}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
              autoComplete="email"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
              autoComplete="current-password"
            />
          </div>

          <div style={styles.error}>{error}</div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.submit, ...(loading ? styles.submitDisabled : {}) }}
          >
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </form>
      </div>
    </div>
  );
}
