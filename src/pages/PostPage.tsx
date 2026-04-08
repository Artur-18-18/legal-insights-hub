import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { getPostBySlug } from "@/lib/supabase-helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, ExternalLink, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const PostPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => getPostBySlug(slug!),
    enabled: !!slug,
  });

  const handlePDF = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10 max-w-3xl">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-5 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground text-lg">Статья не найдена</p>
          <Link to="/" className="text-gold mt-4 inline-block">← На главную</Link>
        </div>
      </Layout>
    );
  }

  const legislationLinks = (post.legislation_links as Array<{ title: string; url: string }>) || [];

  return (
    <Layout>
      <article className="container mx-auto px-4 py-10 max-w-3xl print:max-w-none">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 print:hidden">
          <ArrowLeft className="h-4 w-4" /> Назад
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            {post.categories && (
              <Link to={`/category/${post.categories.slug}`}>
                <Badge variant="secondary">{post.categories.name}</Badge>
              </Link>
            )}
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(post.created_at), "d MMMM yyyy", { locale: ru })}
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

          {post.excerpt && (
            <p className="text-lg text-muted-foreground">{post.excerpt}</p>
          )}

          <div className="flex items-center gap-2 mt-4 print:hidden">
            <Button variant="outline" size="sm" onClick={handlePDF}>
              <FileText className="h-4 w-4 mr-1" /> PDF
            </Button>
          </div>
        </header>

        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full rounded-lg mb-8 shadow-sm"
          />
        )}

        <div
          className="prose prose-slate max-w-none mb-8
            prose-headings:font-serif prose-headings:text-foreground
            prose-p:text-foreground/90 prose-a:text-gold prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Post images */}
        {post.post_images && post.post_images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {post.post_images
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.alt_text || ""}
                  className="rounded-lg w-full shadow-sm"
                  loading="lazy"
                />
              ))}
          </div>
        )}

        {/* Legislation links */}
        {legislationLinks.length > 0 && (
          <div className="bg-muted rounded-lg p-5 mb-8">
            <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gold" /> Ссылки на законодательство
            </h3>
            <ul className="space-y-2">
              {legislationLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gold hover:underline inline-flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" /> {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {post.post_tags && post.post_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 print:hidden">
            {post.post_tags.map((pt) =>
              pt.tags ? (
                <Link key={pt.tags.slug} to={`/tag/${pt.tags.slug}`}>
                  <Badge variant="outline">#{pt.tags.name}</Badge>
                </Link>
              ) : null
            )}
          </div>
        )}
      </article>
    </Layout>
  );
};

export default PostPage;
