import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useI18n, useLocalized } from "@/lib/i18n";
import { uz } from "date-fns/locale";

interface PostCardProps {
  post: {
    title: string;
    title_uz?: string;
    slug: string;
    excerpt: string | null;
    excerpt_uz?: string;
    featured_image: string | null;
    created_at: string;
    categories: { name: string; slug: string } | null;
    post_tags: Array<{ tags: { name: string; slug: string } | null }>;
  };
}

const categoryI18nKey: Record<string, string> = {
  "corporate-law": "cat.corporate-law",
  "corporate-governance": "cat.corporate-governance",
  "competition-law": "cat.competition-law",
  "taxes": "cat.taxes",
  "construction": "cat.construction",
};

export function PostCard({ post }: PostCardProps) {
  const { t, lang } = useI18n();
  const localized = useLocalized();

  const title = localized(post, "title") || post.title;
  const excerpt = localized(post, "excerpt") || post.excerpt;

  const catKey = post.categories?.slug ? categoryI18nKey[post.categories.slug] : null;
  const catName = (lang !== "ru" && catKey) ? t(catKey) : post.categories?.name;

  const dateLocale = lang === "uz" ? uz : ru;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50">
      {post.featured_image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={post.featured_image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      )}
      <CardContent className="p-4 md:p-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {catName && (
            <Link to={`/category/${post.categories!.slug}`}>
              <Badge variant="secondary" className="text-xs font-medium">
                {catName}
              </Badge>
            </Link>
          )}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(new Date(post.created_at), "d MMM yyyy", { locale: dateLocale })}
          </span>
        </div>

        <Link to={`/post/${post.slug}`} className="group/link">
          <h3 className="font-serif text-base md:text-lg font-semibold mb-2 group-hover/link:text-gold transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>

        {excerpt && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{excerpt}</p>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1 flex-wrap min-w-0">
            {post.post_tags?.slice(0, 2).map((pt) =>
              pt.tags ? (
                <Link key={pt.tags.slug} to={`/tag/${pt.tags.slug}`}>
                  <Badge variant="outline" className="text-xs">
                    #{pt.tags.name}
                  </Badge>
                </Link>
              ) : null
            )}
          </div>
          <Link
            to={`/post/${post.slug}`}
            className="text-sm text-gold font-medium flex items-center gap-1 hover:gap-2 transition-all shrink-0"
          >
            {t("posts.read")} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
