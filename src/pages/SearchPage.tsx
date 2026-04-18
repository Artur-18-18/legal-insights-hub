import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { searchPostsMock, tags as mockTags } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Tag } from "lucide-react";
import { useI18n, useLocalized } from "@/lib/i18n";
import { api } from "@/lib/api";

interface TagItem {
  _id?: string;
  id?: string;
  name: string;
  name_uz?: string;
  name_en?: string;
  slug: string;
}

interface Post {
  _id: string;
  id?: string;
  title: string;
  title_uz?: string;
  title_en?: string;
  slug: string;
  excerpt: string | null;
  excerpt_uz?: string;
  excerpt_en?: string;
  content: string;
  content_uz?: string;
  content_en?: string;
  featured_image: string | null;
  created_at: string;
  author_name: string;
  published: boolean;
  legislation_links: Array<{ title: string; url: string }>;
  categories: { name: string; slug: string; icon: string | null } | null;
  post_tags: Array<{ tags: { name: string; slug: string } | null }>;
  post_images: Array<{ url: string; alt_text: string | null }>;
}

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Post[]>([]);
  const [tags, setTags] = useState<TagItem[]>(mockTags);
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();
  const siteName = t("site.name");
  const searchLabel = t("seo.search");
  const localized = useLocalized();

  useEffect(() => {
    api.getTags()
      .then((data) => setTags(data as TagItem[]))
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (!initialQuery) {
      setResults([]);
      return;
    }
    setLoading(true);
    api.getPosts()
      .then((allPosts: Post[]) => {
        const q = initialQuery.toLowerCase();
        const inStr = (s: string | null | undefined) => (s ?? "").toLowerCase().includes(q);
        const filtered = allPosts.filter(
          (p) =>
            p.published &&
            (inStr(p.title) ||
              inStr(p.title_uz) ||
              inStr(p.title_en) ||
              inStr(p.content) ||
              inStr(p.content_uz) ||
              inStr(p.content_en) ||
              inStr(p.excerpt) ||
              inStr(p.excerpt_uz) ||
              inStr(p.excerpt_en)),
        );
        setResults(filtered);
      })
      .catch(() => {
        setResults(searchPostsMock(initialQuery) as unknown as Post[]);
      })
      .finally(() => setLoading(false));
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) setSearchParams({ q: query.trim() });
  };

  return (
    <Layout>
      <Helmet>
        <title>
          {initialQuery
            ? t("seo.search_title_q", {
                search: searchLabel,
                query: initialQuery,
                site: siteName,
              })
            : t("seo.search_title_only", { search: searchLabel, site: siteName })}
        </title>
        <meta
          name="description"
          content={
            initialQuery
              ? t("seo.search_meta_q", { query: initialQuery })
              : t("seo.search_meta_empty")
          }
        />
        <meta
          property="og:title"
          content={
            initialQuery
              ? t("seo.search_og_title_q", {
                  search: searchLabel,
                  query: initialQuery,
                })
              : t("seo.search_og_title_empty", { search: searchLabel })
          }
        />
        <meta property="og:description" content={t("seo.search_og_desc")} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${typeof window !== "undefined" ? window.location.origin : ""}/search${initialQuery ? `?q=${encodeURIComponent(initialQuery)}` : ""}`} />
      </Helmet>
      <div className="container mx-auto px-4 py-8 md:py-10">
        <h1 className="font-serif text-2xl md:text-3xl font-bold mb-4 md:mb-6">{t("search.title")}</h1>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6 md:mb-8 max-w-xl">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("search.placeholder")} className="flex-1" />
          <Button type="submit">
            <Search className="h-4 w-4 mr-1" /> {t("search.button")}
          </Button>
        </form>

        {tags.length > 0 && (
          <div className="mb-6 md:mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" /> {t("search.tags")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link key={tag._id || tag.id} to={`/tag/${tag.slug}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-muted">#{localized(tag, "name") || tag.name}</Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {initialQuery && (
          <>
            <h2 className="text-base md:text-lg font-medium mb-4">
              {t("search.results")} «{initialQuery}»
            </h2>
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {results.map((post) => (
                  <PostCard key={post._id || post.id} post={{ ...post, id: post._id || post.id }} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">{t("search.nothing")}</p>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
