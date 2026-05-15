import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { BlogBodyRenderer, BlogCard } from "@/components/blog/BlogTemplates";
import { api } from "@/services/api";
import { TEMPLATE_META } from "@/data/blogs";
import type { Blog, BlogTemplate } from "@/data/blogs";
import { BLOGS_ENABLED } from "@/config/features";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  beforeLoad: () => {
    if (!BLOGS_ENABLED) throw notFound();
  },
  loader: async ({ params }) => {
    const blog = await api.getBlogBySlug(params.slug);
    if (!blog || blog.status !== "published") throw notFound();
    return { blog };
  },
  head: ({ params, loaderData }) => {
    const blog = loaderData?.blog;
    if (!blog) return { meta: [] };
    const url = `https://momentspackaging.com/blog/${params.slug}`;
    const articleLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: blog.title,
      description: blog.excerpt,
      image: blog.coverImage.url,
      datePublished: blog.publishedAt,
      mainEntityOfPage: url,
      publisher: {
        "@type": "Organization",
        name: "Moments Packaging Kenya",
      },
    };
    return {
      meta: [
        { title: `${blog.title} — Moments Packaging Kenya` },
        { name: "description", content: blog.excerpt },
        { property: "og:title", content: blog.title },
        { property: "og:description", content: blog.excerpt },
        { property: "og:image", content: blog.coverImage.url },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:image", content: blog.coverImage.url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(articleLd) },
      ],
    };
  },
  errorComponent: ({ error }) => {
    const router = useRouter();
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-5 py-20 text-center">
          <h1 className="font-display text-2xl text-foreground">Couldn't load this article</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
          <button
            type="button"
            onClick={() => router.invalidate()}
            className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Retry
          </button>
        </div>
      </SiteLayout>
    );
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl text-foreground">Article not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This story may have been moved or unpublished.
        </p>
        <Link to="/blog" className="mt-6 inline-block text-sm font-medium text-accent">
          ← Back to all articles
        </Link>
      </div>
    </SiteLayout>
  ),
  component: BlogDetailPage,
});

function BlogDetailPage() {
  const { blog } = Route.useLoaderData();
  const meta = TEMPLATE_META[blog.template as BlogTemplate];
  const [related, setRelated] = useState<Blog[] | null>(null);

  useEffect(() => {
    let mounted = true;
    api.getRelatedBlogs(blog.slug, 2).then((r) => {
      if (mounted) setRelated(r);
    });
    return () => {
      mounted = false;
    };
  }, [blog.slug]);

  const date = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-KE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <SiteLayout>
      <article>
        <div className="mx-auto max-w-3xl px-5 pt-8 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to blog
          </Link>
        </div>

        <header className="mx-auto max-w-3xl px-5 pt-6 pb-8 lg:px-8">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-accent">
              {meta.label}
            </span>
            <span>{date}</span>
            <span>· {blog.readingTimeMin} min read</span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-medium leading-[1.15] text-foreground sm:text-4xl lg:text-5xl">
            {blog.title}
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">{blog.excerpt}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            By {blog.author}
          </p>
        </header>

        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-secondary">
            <img
              src={blog.coverImage.url}
              alt={blog.coverImage.alt}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
          {blog.coverImage.caption && (
            <p className="mt-2 text-center text-xs italic text-muted-foreground">
              {blog.coverImage.caption}
            </p>
          )}
        </div>

        <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8 lg:py-14">
          <BlogBodyRenderer body={blog.body} />

          {blog.secondaryImage && (
            <figure className="my-10 overflow-hidden rounded-2xl bg-secondary">
              <img
                src={blog.secondaryImage.url}
                alt={blog.secondaryImage.alt}
                className="aspect-[16/9] w-full object-cover"
              />
              {blog.secondaryImage.caption && (
                <figcaption className="px-4 py-2 text-center text-xs italic text-muted-foreground">
                  {blog.secondaryImage.caption}
                </figcaption>
              )}
            </figure>
          )}

          {blog.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2 border-t border-border pt-6">
              {blog.tags.map((t: string) => (
                <span
                  key={t}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {related && related.length > 0 && (
          <aside className="border-t border-border bg-secondary/40">
            <div className="mx-auto max-w-5xl px-5 py-14 lg:px-8 lg:py-20">
              <p className="text-xs uppercase tracking-[0.25em] text-accent">Keep reading</p>
              <h2 className="mt-3 font-display text-2xl font-medium text-foreground sm:text-3xl">
                Suggested next read
              </h2>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    to="/blog/$slug"
                    params={{ slug: r.slug }}
                    className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <BlogCard blog={r} />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        )}
      </article>
    </SiteLayout>
  );
}
