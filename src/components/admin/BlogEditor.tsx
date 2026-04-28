import { useState, type CSSProperties, type ChangeEvent } from "react";
import type {
  Blog,
  BlogBody,
  BlogTemplate,
  BlogStatus,
  BlogImage,
  EducativeBody,
  ExplanatoryBody,
  ScenarioBody,
  StorylineBody,
  AnnouncementBody,
} from "@/data/blogs";
import { TEMPLATE_META } from "@/data/blogs";

// Admin-side editor styled to match AdminLayout's dark surface.
// Renders a different field set per template — these are the same fields the
// Spring Boot backend will need to accept on POST/PUT /api/admin/blogs.

const templateBtnStyle = (active: boolean): CSSProperties => ({
  background: active ? "color-mix(in oklab, var(--admin-accent) 34%, var(--admin-surface))" : "var(--admin-bg)",
  border: `1px solid ${active ? "var(--admin-accent-hover)" : "var(--admin-border)"}`,
  borderRadius: 10,
  padding: 12,
  textAlign: "left",
  cursor: "pointer",
  color: active ? "var(--cream)" : "var(--admin-text)",
  fontFamily: "inherit",
});

const styles: Record<string, CSSProperties> = {
  wrap: { maxWidth: 880, display: "flex", flexDirection: "column", gap: 18 },
  row: { display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "var(--admin-muted)",
  },
  input: {
    background: "var(--admin-bg)",
    border: "1px solid var(--admin-border)",
    borderRadius: 8,
    padding: "9px 12px",
    color: "var(--admin-text)",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
  },
  textarea: {
    background: "var(--admin-bg)",
    border: "1px solid var(--admin-border)",
    borderRadius: 8,
    padding: "10px 12px",
    color: "var(--admin-text)",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    resize: "vertical",
    minHeight: 80,
  },
  card: {
    background: "var(--admin-surface)",
    border: "1px solid var(--admin-border)",
    borderRadius: 10,
    padding: 16,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardTitle: { fontSize: 13, fontWeight: 600, color: "var(--admin-text)" },
  helper: { fontSize: 11, color: "var(--admin-muted)" },
  templateGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: 10,
  },
  templateLabel: { fontSize: 12.5, fontWeight: 600 },
  templateBlurb: { fontSize: 10.5, color: "var(--admin-muted)", marginTop: 4 },
  ghostBtn: {
    background: "transparent",
    border: "1px solid var(--admin-border)",
    color: "var(--admin-muted)",
    borderRadius: 8,
    padding: "6px 10px",
    fontSize: 11.5,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  primaryBtn: {
    background: "var(--admin-accent)",
    color: "var(--cream)",
    border: "none",
    borderRadius: 8,
    padding: "9px 16px",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  dangerBtn: {
    background: "transparent",
    border: "1px solid var(--admin-clay)",
    color: "var(--admin-clay)",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  imagePreview: {
    aspectRatio: "16/9",
    background: "var(--admin-bg)",
    border: "1px dashed var(--admin-border)",
    borderRadius: 8,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--admin-muted)",
    fontSize: 11,
  },
  actionsBar: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    paddingTop: 12,
    borderTop: "1px solid var(--admin-border)",
  },
};

// Default empty bodies per template ------------------------------------------
function emptyBody(template: BlogTemplate): BlogBody {
  switch (template) {
    case "educative":
      return {
        template,
        data: {
          intro: "",
          keyPoints: [{ heading: "", body: "" }],
          conclusion: "",
        } satisfies EducativeBody,
      };
    case "explanatory":
      return {
        template,
        data: { problem: "", mechanism: "", takeaway: "" } satisfies ExplanatoryBody,
      };
    case "scenario":
      return {
        template,
        data: { setup: "", challenge: "", resolution: "", callout: "" } satisfies ScenarioBody,
      };
    case "storyline":
      return {
        template,
        data: {
          hook: "",
          chapters: [{ title: "", body: "" }],
          closing: "",
        } satisfies StorylineBody,
      };
    case "announcement":
      return {
        template,
        data: { headline: "", body: "", ctaLabel: "", ctaHref: "" } satisfies AnnouncementBody,
      };
  }
}

export interface BlogFormValues {
  title: string;
  excerpt: string;
  template: BlogTemplate;
  status: BlogStatus;
  coverImage: BlogImage;
  secondaryImage?: BlogImage;
  body: BlogBody;
  author: string;
  tags: string[];
}

export function blogToFormValues(blog: Blog): BlogFormValues {
  return {
    title: blog.title,
    excerpt: blog.excerpt,
    template: blog.template,
    status: blog.status,
    coverImage: blog.coverImage,
    secondaryImage: blog.secondaryImage,
    body: blog.body,
    author: blog.author,
    tags: blog.tags,
  };
}

export function emptyFormValues(): BlogFormValues {
  return {
    title: "",
    excerpt: "",
    template: "educative",
    status: "draft",
    coverImage: { url: "", alt: "" },
    body: emptyBody("educative"),
    author: "Moments Packaging Director",
    tags: [],
  };
}

interface BlogEditorProps {
  initial: BlogFormValues;
  submitLabel: string;
  onSubmit: (values: BlogFormValues) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  onCancel: () => void;
}

export function BlogEditor({ initial, submitLabel, onSubmit, onDelete, onCancel }: BlogEditorProps) {
  const [values, setValues] = useState<BlogFormValues>(initial);
  const [tagsInput, setTagsInput] = useState(initial.tags.join(", "));
  const [busy, setBusy] = useState(false);

  function patch<K extends keyof BlogFormValues>(key: K, val: BlogFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function changeTemplate(template: BlogTemplate) {
    setValues((v) => ({ ...v, template, body: emptyBody(template) }));
  }

  // Read uploaded image as data URL (mock — backend will return a CDN URL)
  function readImage(e: ChangeEvent<HTMLInputElement>, slot: "cover" | "secondary") {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result ?? "");
      if (slot === "cover") {
        patch("coverImage", { ...values.coverImage, url });
      } else {
        patch("secondaryImage", { url, alt: values.secondaryImage?.alt ?? "" });
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSave(status: BlogStatus) {
    setBusy(true);
    try {
      await onSubmit({
        ...values,
        status,
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={styles.wrap}>
      {/* Meta */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardTitle}>Article basics</span>
          <span style={styles.helper}>Required for every template</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={styles.field}>
            <label style={styles.label}>Title</label>
            <input
              style={styles.input}
              value={values.title}
              onChange={(e) => patch("title", e.target.value)}
              placeholder="The Westlands Juice Bar That Doubled Orders"
              maxLength={120}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Excerpt (1–2 sentences shown on cards)</label>
            <textarea
              style={styles.textarea}
              value={values.excerpt}
              onChange={(e) => patch("excerpt", e.target.value)}
              maxLength={240}
              rows={2}
            />
          </div>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Author</label>
              <input
                style={styles.input}
                value={values.author}
                onChange={(e) => patch("author", e.target.value)}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Tags (comma separated)</label>
              <input
                style={styles.input}
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="kraft, bags, buyer-guide"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Template picker */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardTitle}>Template</span>
          <span style={styles.helper}>Choosing a template clears the body fields</span>
        </div>
        <div style={styles.templateGrid}>
          {(Object.keys(TEMPLATE_META) as BlogTemplate[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => changeTemplate(t)}
              style={templateBtnStyle(values.template === t)}
            >
              <div style={styles.templateLabel}>{TEMPLATE_META[t].label}</div>
              <div style={styles.templateBlurb}>{TEMPLATE_META[t].blurb}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Images */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardTitle}>Images</span>
          <span style={styles.helper}>Cover required · Secondary optional</span>
        </div>
        <div style={styles.row}>
          <ImageSlot
            label="Cover image"
            image={values.coverImage}
            onAlt={(alt) => patch("coverImage", { ...values.coverImage, alt })}
            onCaption={(caption) => patch("coverImage", { ...values.coverImage, caption })}
            onFile={(e) => readImage(e, "cover")}
            onUrl={(url) => patch("coverImage", { ...values.coverImage, url })}
            onClear={() => patch("coverImage", { url: "", alt: "" })}
          />
          <ImageSlot
            label="Secondary image (optional)"
            image={values.secondaryImage ?? { url: "", alt: "" }}
            onAlt={(alt) =>
              patch("secondaryImage", { url: values.secondaryImage?.url ?? "", alt })
            }
            onCaption={(caption) =>
              patch("secondaryImage", {
                url: values.secondaryImage?.url ?? "",
                alt: values.secondaryImage?.alt ?? "",
                caption,
              })
            }
            onFile={(e) => readImage(e, "secondary")}
            onUrl={(url) =>
              patch("secondaryImage", { url, alt: values.secondaryImage?.alt ?? "" })
            }
            onClear={() => patch("secondaryImage", undefined)}
          />
        </div>
      </div>

      {/* Body fields per template */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardTitle}>{TEMPLATE_META[values.template].label} content</span>
          <span style={styles.helper}>{TEMPLATE_META[values.template].blurb}</span>
        </div>
        <BodyFields body={values.body} onChange={(body) => patch("body", body)} />
      </div>

      <div style={styles.actionsBar}>
        {onDelete && (
          <button type="button" style={styles.dangerBtn} onClick={() => void onDelete()} disabled={busy}>
            Delete
          </button>
        )}
        <button type="button" style={styles.ghostBtn} onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="button" style={styles.ghostBtn} onClick={() => void handleSave("draft")} disabled={busy}>
          Save draft
        </button>
        <button
          type="button"
          style={styles.primaryBtn}
          onClick={() => void handleSave("published")}
          disabled={busy || !values.title || !values.coverImage.url}
        >
          {busy ? "Saving…" : submitLabel}
        </button>
      </div>
    </div>
  );
}

// ---------- Body field renderers ---------------------------------------------

function BodyFields({ body, onChange }: { body: BlogBody; onChange: (b: BlogBody) => void }) {
  switch (body.template) {
    case "educative":
      return <EducativeFields data={body.data} onChange={(d) => onChange({ template: "educative", data: d })} />;
    case "explanatory":
      return <ExplanatoryFields data={body.data} onChange={(d) => onChange({ template: "explanatory", data: d })} />;
    case "scenario":
      return <ScenarioFields data={body.data} onChange={(d) => onChange({ template: "scenario", data: d })} />;
    case "storyline":
      return <StorylineFields data={body.data} onChange={(d) => onChange({ template: "storyline", data: d })} />;
    case "announcement":
      return <AnnouncementFields data={body.data} onChange={(d) => onChange({ template: "announcement", data: d })} />;
  }
}

function EducativeFields({ data, onChange }: { data: EducativeBody; onChange: (d: EducativeBody) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Field label="Intro paragraph">
        <textarea style={styles.textarea} value={data.intro} rows={3}
          onChange={(e) => onChange({ ...data, intro: e.target.value })} />
      </Field>
      <div>
        <div style={{ ...styles.label, marginBottom: 6 }}>Key points</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.keyPoints.map((kp, i) => (
            <div key={i} style={{ ...styles.card, padding: 12 }}>
              <input style={{ ...styles.input, marginBottom: 8 }} placeholder="Heading"
                value={kp.heading}
                onChange={(e) => {
                  const next = [...data.keyPoints];
                  next[i] = { ...kp, heading: e.target.value };
                  onChange({ ...data, keyPoints: next });
                }} />
              <textarea style={styles.textarea} placeholder="Body" rows={2}
                value={kp.body}
                onChange={(e) => {
                  const next = [...data.keyPoints];
                  next[i] = { ...kp, body: e.target.value };
                  onChange({ ...data, keyPoints: next });
                }} />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
                <button type="button" style={styles.ghostBtn}
                  onClick={() => onChange({ ...data, keyPoints: data.keyPoints.filter((_, j) => j !== i) })}
                  disabled={data.keyPoints.length === 1}>Remove</button>
              </div>
            </div>
          ))}
          <button type="button" style={styles.ghostBtn}
            onClick={() => onChange({ ...data, keyPoints: [...data.keyPoints, { heading: "", body: "" }] })}>
            + Add key point
          </button>
        </div>
      </div>
      <Field label="Conclusion">
        <textarea style={styles.textarea} value={data.conclusion} rows={2}
          onChange={(e) => onChange({ ...data, conclusion: e.target.value })} />
      </Field>
    </div>
  );
}

function ExplanatoryFields({ data, onChange }: { data: ExplanatoryBody; onChange: (d: ExplanatoryBody) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Field label="The problem">
        <textarea style={styles.textarea} rows={3} value={data.problem}
          onChange={(e) => onChange({ ...data, problem: e.target.value })} />
      </Field>
      <Field label="How it works (mechanism)">
        <textarea style={styles.textarea} rows={4} value={data.mechanism}
          onChange={(e) => onChange({ ...data, mechanism: e.target.value })} />
      </Field>
      <Field label="The takeaway">
        <textarea style={styles.textarea} rows={3} value={data.takeaway}
          onChange={(e) => onChange({ ...data, takeaway: e.target.value })} />
      </Field>
    </div>
  );
}

function ScenarioFields({ data, onChange }: { data: ScenarioBody; onChange: (d: ScenarioBody) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Field label="Setup (who, where, what)">
        <textarea style={styles.textarea} rows={3} value={data.setup}
          onChange={(e) => onChange({ ...data, setup: e.target.value })} />
      </Field>
      <Field label="Challenge they hit">
        <textarea style={styles.textarea} rows={3} value={data.challenge}
          onChange={(e) => onChange({ ...data, challenge: e.target.value })} />
      </Field>
      <Field label="Resolution / lesson">
        <textarea style={styles.textarea} rows={3} value={data.resolution}
          onChange={(e) => onChange({ ...data, resolution: e.target.value })} />
      </Field>
      <Field label="Pull quote / callout (optional)">
        <input style={styles.input} value={data.callout ?? ""}
          onChange={(e) => onChange({ ...data, callout: e.target.value })} />
      </Field>
    </div>
  );
}

function StorylineFields({ data, onChange }: { data: StorylineBody; onChange: (d: StorylineBody) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Field label="Hook (opening paragraph)">
        <textarea style={styles.textarea} rows={3} value={data.hook}
          onChange={(e) => onChange({ ...data, hook: e.target.value })} />
      </Field>
      <div>
        <div style={{ ...styles.label, marginBottom: 6 }}>Chapters</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.chapters.map((c, i) => (
            <div key={i} style={{ ...styles.card, padding: 12 }}>
              <input style={{ ...styles.input, marginBottom: 8 }} placeholder="Chapter title"
                value={c.title}
                onChange={(e) => {
                  const next = [...data.chapters];
                  next[i] = { ...c, title: e.target.value };
                  onChange({ ...data, chapters: next });
                }} />
              <textarea style={styles.textarea} placeholder="Chapter body" rows={3}
                value={c.body}
                onChange={(e) => {
                  const next = [...data.chapters];
                  next[i] = { ...c, body: e.target.value };
                  onChange({ ...data, chapters: next });
                }} />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
                <button type="button" style={styles.ghostBtn}
                  onClick={() => onChange({ ...data, chapters: data.chapters.filter((_, j) => j !== i) })}
                  disabled={data.chapters.length === 1}>Remove</button>
              </div>
            </div>
          ))}
          <button type="button" style={styles.ghostBtn}
            onClick={() => onChange({ ...data, chapters: [...data.chapters, { title: "", body: "" }] })}>
            + Add chapter
          </button>
        </div>
      </div>
      <Field label="Closing line">
        <textarea style={styles.textarea} rows={2} value={data.closing}
          onChange={(e) => onChange({ ...data, closing: e.target.value })} />
      </Field>
    </div>
  );
}

function AnnouncementFields({ data, onChange }: { data: AnnouncementBody; onChange: (d: AnnouncementBody) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Field label="Headline">
        <input style={styles.input} value={data.headline}
          onChange={(e) => onChange({ ...data, headline: e.target.value })} />
      </Field>
      <Field label="Body">
        <textarea style={styles.textarea} rows={4} value={data.body}
          onChange={(e) => onChange({ ...data, body: e.target.value })} />
      </Field>
      <div style={styles.row}>
        <Field label="CTA label (optional)">
          <input style={styles.input} value={data.ctaLabel ?? ""}
            onChange={(e) => onChange({ ...data, ctaLabel: e.target.value })} />
        </Field>
        <Field label="CTA link (optional)">
          <input style={styles.input} value={data.ctaHref ?? ""} placeholder="/products?category=mailers"
            onChange={(e) => onChange({ ...data, ctaHref: e.target.value })} />
        </Field>
      </div>
    </div>
  );
}

// ---------- Small helpers ----------------------------------------------------

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

function ImageSlot({
  label,
  image,
  onAlt,
  onCaption,
  onFile,
  onUrl,
  onClear,
}: {
  label: string;
  image: BlogImage;
  onAlt: (alt: string) => void;
  onCaption: (caption: string) => void;
  onFile: (e: ChangeEvent<HTMLInputElement>) => void;
  onUrl: (url: string) => void;
  onClear: () => void;
}) {
  const [urlInput, setUrlInput] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={styles.label}>{label}</label>
      <div style={styles.imagePreview}>
        {image.url ? (
          <img src={image.url} alt={image.alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span>No image yet</span>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <label style={{ ...styles.ghostBtn, cursor: "pointer" }}>
          {image.url ? "Replace file" : "Upload file"}
          <input type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
        </label>
        {image.url && (
          <button type="button" style={styles.ghostBtn} onClick={onClear}>Remove</button>
        )}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          style={{ ...styles.input, flex: 1 }}
          placeholder="…or paste image URL (https://…)"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
        />
        <button
          type="button"
          style={styles.ghostBtn}
          onClick={() => {
            const trimmed = urlInput.trim();
            if (!trimmed) return;
            onUrl(trimmed);
            setUrlInput("");
          }}
        >
          Use URL
        </button>
      </div>
      <p style={{ ...styles.helper, marginTop: -2 }}>
        URL paste is for the demo. Once the Java backend is live, uploads will go to Cloudinary and return a permanent URL.
      </p>
      <input style={styles.input} placeholder="Alt text (accessibility)"
        value={image.alt} onChange={(e) => onAlt(e.target.value)} />
      <input style={styles.input} placeholder="Caption (optional)"
        value={image.caption ?? ""} onChange={(e) => onCaption(e.target.value)} />
    </div>
  );
}
