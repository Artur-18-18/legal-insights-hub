import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, ExternalLink, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useI18n } from "@/lib/i18n";
import { getPostBySlug } from "@/lib/mock-data";

const PostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useI18n();
  const post = slug ? getPostBySlug(slug) : null;

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground text-lg">{t("posts.notfound")}</p>
          <Link to="/" className="text-gold mt-4 inline-block">{t("posts.tohome")}</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="container mx-auto px-4 py-6 md:py-10 max-w-3xl print:max-w-none">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 md:mb-6 print:hidden">
          <ArrowLeft className="h-4 w-4" /> {t("posts.back")}
        </Link>

        <header className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
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
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">{post.title}</h1>
          {post.excerpt && <p className="text-base md:text-lg text-muted-foreground">{post.excerpt}</p>}
          <div className="flex items-center gap-2 mt-4 print:hidden">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <FileText className="h-4 w-4 mr-1" /> {t("posts.pdf")}
            </Button>
          </div>
        </header>

        {post.featured_image && (
          <img src={post.featured_image} alt={post.title} className="w-full rounded-lg mb-6 md:mb-8 shadow-sm" />
        )}

        <div
          className="prose prose-slate max-w-none mb-6 md:mb-8 prose-sm md:prose-base prose-headings:font-serif prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-gold prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.legislation_links.length > 0 && (
          <div className="bg-muted rounded-lg p-4 md:p-5 mb-6 md:mb-8">
            <h3 className="font-serif text-base md:text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gold" /> {t("posts.legislation")}
            </h3>
            <ul className="space-y-2">
              {post.legislation_links.map((link, i) => (
                <li key={i}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gold hover:underline inline-flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" /> {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {post.post_tags.length > 0 && (
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
