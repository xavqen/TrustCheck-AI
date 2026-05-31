import Link from "next/link";
import { BLOG_POSTS } from "@/lib/content/blog";
import { Card, CardContent } from "@/components/ui/card";

export default function BlogPage() {
  return (
    <section className="container-px mx-auto max-w-5xl py-10">
      <h1 className="text-3xl font-bold tracking-tight">Scam safety guides</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {BLOG_POSTS.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="h-full transition hover:-translate-y-1 hover:shadow-lg"><CardContent className="p-6"><p className="text-xs font-medium uppercase tracking-wide text-emerald-600">{post.category}</p><h2 className="mt-2 text-xl font-semibold">{post.title}</h2><p className="mt-3 text-sm text-muted-foreground">{post.description}</p></CardContent></Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
