import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { productStore } from "@/services/productStore";
import { api } from "@/services/api";
import type { Product } from "@/data/products";

export const Route = createFileRoute("/_adminAuth/admin/enquiries/new")({
  component: NewEnquiryPage,
});

const styles: Record<string, CSSProperties> = {
  form: { maxWidth: 760, display: "flex", flexDirection: "column", gap: 16 },
  card: { background: "var(--admin-surface)", border: "1px solid #1E2535", borderRadius: 10, padding: 16 },
  title: { fontSize: 13, fontWeight: 600, color: "var(--admin-text)", marginBottom: 14 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--admin-muted)" },
  input: { background: "var(--admin-bg)", border: "1px solid #1E2535", borderRadius: 8, padding: "9px 12px", color: "var(--admin-text)", fontSize: 13, fontFamily: "inherit", outline: "none" },
  textarea: { background: "var(--admin-bg)", border: "1px solid #1E2535", borderRadius: 8, padding: "10px 12px", color: "var(--admin-text)", fontSize: 13, fontFamily: "inherit", outline: "none", minHeight: 90, resize: "vertical" },
  actions: { display: "flex", justifyContent: "flex-end", gap: 10 },
  ghostBtn: { background: "transparent", border: "1px solid #1E2535", color: "var(--admin-muted)", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  primaryBtn: { background: "var(--admin-accent)", color: "var(--cream)", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
  error: { fontSize: 12, color: "var(--admin-clay)" },
};

function NewEnquiryPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [customerType, setCustomerType] = useState<"SME" | "CORPORATE">("SME");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [productId, setProductId] = useState("");
  const [customProduct, setCustomProduct] = useState("");
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void productStore.list().then(setProducts).catch(() => setProducts([]));
  }, []);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId),
    [productId, products],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const productName = selectedProduct?.name ?? customProduct.trim();
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    if (!productName) {
      setError("Select a product or enter a custom product name.");
      return;
    }

    setBusy(true);
    try {
      await api.submitEnquiry({
        customerType,
        name: name.trim(),
        companyName: companyName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim(),
        message: message.trim() || undefined,
        products: [{ productId: selectedProduct?.id ?? productName, name: productName, qty }],
      });
      navigate({ to: "/admin/enquiries" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create enquiry.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout title="New enquiry">
      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.card}>
          <div style={styles.title}>Customer details</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={styles.row}>
              <label style={styles.field}>
                <span style={styles.label}>Customer type</span>
                <select style={styles.input} value={customerType} onChange={(e) => setCustomerType(e.target.value as "SME" | "CORPORATE")}>
                  <option value="SME">SME</option>
                  <option value="CORPORATE">Corporate</option>
                </select>
              </label>
              <label style={styles.field}>
                <span style={styles.label}>Name</span>
                <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} required />
              </label>
            </div>
            <div style={styles.row}>
              <label style={styles.field}>
                <span style={styles.label}>Company</span>
                <input style={styles.input} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </label>
              <label style={styles.field}>
                <span style={styles.label}>Phone</span>
                <input style={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </label>
            </div>
            <label style={styles.field}>
              <span style={styles.label}>Email</span>
              <input type="email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.title}>Product requested</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={styles.row}>
              <label style={styles.field}>
                <span style={styles.label}>Catalogue product</span>
                <select style={styles.input} value={productId} onChange={(e) => setProductId(e.target.value)}>
                  <option value="">Select product…</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </label>
              <label style={styles.field}>
                <span style={styles.label}>Quantity</span>
                <input type="number" min={1} style={styles.input} value={qty} onChange={(e) => setQty(Number(e.target.value) || 1)} />
              </label>
            </div>
            <label style={styles.field}>
              <span style={styles.label}>Custom product name</span>
              <input style={styles.input} value={customProduct} onChange={(e) => setCustomProduct(e.target.value)} placeholder="Use when the item is not in the catalogue" />
            </label>
            <label style={styles.field}>
              <span style={styles.label}>Message</span>
              <textarea style={styles.textarea} value={message} onChange={(e) => setMessage(e.target.value)} />
            </label>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.actions}>
          <button type="button" style={styles.ghostBtn} onClick={() => navigate({ to: "/admin/enquiries" })} disabled={busy}>Cancel</button>
          <button type="submit" style={styles.primaryBtn} disabled={busy}>{busy ? "Creating…" : "Create enquiry"}</button>
        </div>
      </form>
    </AdminLayout>
  );
}