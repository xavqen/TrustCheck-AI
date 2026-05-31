import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BLOG_POSTS } from "@/lib/content/blog";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((item) => item.slug === slug);
  if (!post) return {};
  return { title: post.title, description: post.description };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((item) => item.slug === slug);
  if (!post) notFound();

  return (
    <article className="container-px mx-auto max-w-3xl py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">{post.category}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{post.description}</p>
      <div className="mt-8 space-y-6 text-muted-foreground">
        {post.sections.map((section) => (
          <section key={section.heading} className="rounded-2xl border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground">{section.heading}</h2>
            <p className="mt-3 leading-7">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
