import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { CategoryCard } from "@/components/CategoryCard";
import { PostsMobileCarousel } from "@/components/PostsMobileCarousel";
import { Scale, BookOpen, Search as SearchIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import type { Post, Category as CategoryType } from "@/lib/mock-data";

const Index = () => {
  const { t } = useI18n();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getPosts({ limit: 18 }), api.getCategories()])
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

  const publishedPosts = posts.filter((p) => p.published);

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
            <PostsMobileCarousel posts={publishedPosts} ariaLabel={t("category.posts_slider")} />
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {publishedPosts.map((post) => (
                <PostCard key={post.id} post={mapPost(post)} />
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
