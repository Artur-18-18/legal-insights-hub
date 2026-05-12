import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { CategoryCard } from "@/components/CategoryCard";
import { PostsMobileCarousel } from "@/components/PostsMobileCarousel";
import { Scale, BookOpen, Search as SearchIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n, useLocalized } from "@/lib/i18n";
import { api } from "@/lib/api";
import type { Post, Category as CategoryType } from "@/lib/mock-data";

const UNCATEGORIZED_KEY = "__none__";

type FeedPost = Post & {
  category?: { slug: string; name?: string } | null;
  categories?: { slug: string; name?: string } | null;
};

function categorySlugOf(post: FeedPost): string | null {
  return post.category?.slug ?? post.categories?.slug ?? null;
}

function sortByDateDesc(a: FeedPost, b: FeedPost) {
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

const Index = () => {
  const { t } = useI18n();
  const localized = useLocalized();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getPosts({ limit: 120 }), api.getCategories()])
      .then(([postsData, catsData]) => {
        setPosts(postsData as Post[]);
        setCategories(catsData);
      })
      .catch((err) => {
        console.error("Failed to load data:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const mapCategory = (cat: CategoryType) => cat;

  const mapPost = (post: Post) => post;

  const publishedPosts = useMemo(() => {
    const list = posts.filter((p) => p.published) as FeedPost[];
    return [...list].sort(sortByDateDesc);
  }, [posts]);

  const mobileSections = useMemo(() => {
    const bySlug = new Map<string, FeedPost[]>();

    for (const p of publishedPosts) {
      const slug = categorySlugOf(p) ?? UNCATEGORIZED_KEY;
      if (!bySlug.has(slug)) bySlug.set(slug, []);
      bySlug.get(slug)!.push(p);
    }

    for (const list of bySlug.values()) {
      list.sort(sortByDateDesc);
    }

    const out: Array<{
      key: string;
      slug: string;
      posts: FeedPost[];
      meta: CategoryType | null;
    }> = [];
    const used = new Set<string>();

    for (const cat of categories) {
      const list = bySlug.get(cat.slug);
      if (list?.length) {
        out.push({ key: cat.slug, slug: cat.slug, posts: list, meta: cat });
        used.add(cat.slug);
      }
    }

    for (const [slug, list] of bySlug) {
      if (!list.length || slug === UNCATEGORIZED_KEY || used.has(slug)) continue;
      out.push({
        key: slug,
        slug,
        posts: list,
        meta: categories.find((c) => c.slug === slug) ?? null,
      });
      used.add(slug);
    }

    const unc = bySlug.get(UNCATEGORIZED_KEY);
    if (unc?.length) {
      out.push({
        key: UNCATEGORIZED_KEY,
        slug: UNCATEGORIZED_KEY,
        posts: unc,
        meta: null,
      });
    }

    return out;
  }, [publishedPosts, categories]);

  return (
    <Layout>
      <Helmet>
        <title>{t("site.title")} — {t("site.name")}</title>
        <meta name="description" content={t("site.subtitle")} />
        <meta property="og:title" content={t("site.title")} />
        <meta property="og:description" content={t("site.subtitle")} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={typeof window !== "undefined" ? window.location.origin : ""} />
      </Helmet>
      <section className="hero-gradient py-12 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <Scale className="h-10 w-10 md:h-12 md:w-12 text-gold" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold text-primary-foreground mb-3 md:mb-4">
            {t("site.title")}
          </h1>
          <p className="text-primary-foreground/80 text-sm md:text-lg max-w-2xl mx-auto mb-6 px-2">
            {t("site.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/search"
              className="inline-flex items-center justify-center gap-2 bg-gold px-5 py-2.5 rounded-md text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
            >
              <SearchIcon className="h-4 w-4" /> {t("nav.search")}
            </Link>
            <Link
              to="/category/corporate-law"
              className="inline-flex items-center justify-center gap-2 bg-primary-foreground/10 border border-primary-foreground/20 px-5 py-2.5 rounded-md text-sm font-medium text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
            >
              <BookOpen className="h-4 w-4" /> {t("nav.categories")}
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 -mt-6 md:-mt-8 relative z-10 mb-10 md:mb-12">
        {loading ? (
          <div className="flex md:grid md:grid-cols-5 gap-3 overflow-hidden -mx-4 px-4 md:mx-0 md:px-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="shrink-0 w-[min(260px,88vw)] md:w-auto h-20 bg-muted rounded animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div
            className="flex md:grid md:grid-cols-5 gap-3 overflow-x-auto snap-x snap-mandatory pb-1 -mx-4 px-4 md:mx-0 md:px-0 scroll-pl-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {categories.map((cat) => (
              <div
                key={cat.id || cat.slug}
                className="snap-center shrink-0 w-[min(260px,88vw)] sm:w-[min(240px,45%)] md:w-auto md:min-w-0 md:shrink"
              >
                <CategoryCard category={mapCategory(cat)} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="container mx-auto px-4 pb-12 md:pb-16">
        <h2 className="font-serif text-xl md:text-2xl font-bold mb-4 md:mb-6">{t("posts.latest")}</h2>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : publishedPosts.length > 0 ? (
          <>
            <div className="md:hidden space-y-10">
              {mobileSections.map((section) => {
                const title =
                  section.slug === UNCATEGORIZED_KEY
                    ? t("posts.uncategorized")
                    : section.meta
                      ? localized(section.meta, "name") || section.meta.name
                      : (() => {
                          const p0 = section.posts[0];
                          const c = p0?.category ?? p0?.categories;
                          if (!c) return section.slug;
                          return localized(c, "name") || c.name || section.slug;
                        })();

                const ariaForSlider =
                  section.slug === UNCATEGORIZED_KEY
                    ? t("category.posts_slider")
                    : `${title}: ${t("category.posts_slider")}`;

                return (
                  <div key={section.key}>
                    <div className="flex flex-col gap-2 mb-3">
                      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                        <h3 className="font-serif text-lg font-semibold">{title}</h3>
                        {section.slug !== UNCATEGORIZED_KEY && (
                          <Link
                            to={`/category/${section.slug}`}
                            className="text-sm font-medium text-gold hover:underline shrink-0"
                          >
                            {t("posts.all_in_category")} →
                          </Link>
                        )}
                      </div>
                    </div>
                    <PostsMobileCarousel posts={section.posts} ariaLabel={ariaForSlider} />
                  </div>
                );
              })}
            </div>

            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {publishedPosts.map((post) => (
                <PostCard
                  key={String((post as { id?: string; _id?: string }).id ?? (post as { _id?: string })._id ?? post.slug)}
                  post={mapPost(post)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 md:py-16 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">{t("posts.empty")}</p>
            <p className="text-sm mt-1">{t("posts.soon")}</p>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Index;
