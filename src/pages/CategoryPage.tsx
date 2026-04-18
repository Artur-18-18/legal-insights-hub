import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { BookOpen } from "lucide-react";
import { useI18n, useLocalized } from "@/lib/i18n";
import { api } from "@/lib/api";
import { getPostsByCategory } from "@/lib/mock-data";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface Category {
  _id: string;
  name: string;
  name_uz?: string;
  name_en?: string;
  slug: string;
  description: string | null;
  description_uz?: string;
  description_en?: string;
}

interface Post {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  created_at: string;
  author_name: string;
  published: boolean;
  legislation_links: Array<{ title: string; url: string }>;
  category?: { name: string; slug: string; icon: string | null } | null;
  categories?: { name: string; slug: string; icon: string | null } | null;
  tags?: Array<{ name: string; slug: string }>;
  post_tags?: Array<{ tags: { name: string; slug: string } | null }>;
  post_images: Array<{ url: string; alt_text: string | null }>;
}

function CategoryPostsMobileCarousel({ posts }: { posts: Post[] }) {
  const { t } = useI18n();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    const sync = () => {
      setSnapCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap());
    };
    sync();
    api.on("select", sync);
    api.on("reInit", sync);
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  return (
    <div className="md:hidden w-full">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: posts.length > 1,
          containScroll: "trimSnaps",
          dragFree: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {posts.map((post) => {
            const pid = post._id || post.id;
            return (
              <CarouselItem key={pid} className="pl-3 basis-full min-w-0">
                <PostCard post={{ ...post, id: pid }} />
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
      {snapCount > 1 && (
        <div
          className="flex justify-center items-center gap-1.5 mt-4"
          role="tablist"
          aria-label={t("category.posts_slider")}
        >
          {Array.from({ length: snapCount }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={current === i}
              className={cn(
                "h-2 rounded-full transition-all duration-300 touch-manipulation",
                current === i ? "w-6 bg-gold" : "w-2 bg-muted-foreground/35 hover:bg-muted-foreground/50",
              )}
              onClick={() => api?.scrollTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useI18n();
  const siteName = t("site.name");
  const localized = useLocalized();
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const [postsData, cat] = await Promise.all([
          api.getPosts({ category: slug }),
          api.getCategoryBySlug(slug),
        ]);
        if (cancelled) return;
        if (cat) {
          setCategory(cat as Category);
          setPosts(postsData as Post[]);
        } else {
          const mockData = getPostsByCategory(slug);
          if (mockData) {
            setCategory(mockData.category as unknown as Category);
            setPosts(mockData.posts as unknown as Post[]);
          } else {
            setCategory(null);
            setPosts([]);
          }
        }
      } catch {
        if (cancelled) return;
        const mockData = getPostsByCategory(slug);
        if (mockData) {
          setCategory(mockData.category as unknown as Category);
          setPosts(mockData.posts as unknown as Post[]);
        } else {
          setCategory(null);
          setPosts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 md:py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>
          {category
            ? t("seo.category_title", {
                name: localized(category, "name") || category.name,
                site: siteName,
              })
            : t("seo.category_fallback_title", {
                label: t("seo.category"),
                site: siteName,
              })}
        </title>
        <meta
          name="description"
          content={
            localized(category, "description") ||
            category?.description ||
            (category
              ? t("seo.category_meta_name", {
                  name: localized(category, "name") || category.name,
                })
              : t("site.subtitle"))
          }
        />
        <meta
          property="og:title"
          content={localized(category, "name") || category?.name || t("seo.category")}
        />
        <meta
          property="og:description"
          content={
            localized(category, "description") || category?.description || ""
          }
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${typeof window !== "undefined" ? window.location.origin : ""}/category/${slug}`} />
      </Helmet>
      <div className="container mx-auto px-4 py-8 md:py-10">
        {category ? (
          <>
            <h1 className="font-serif text-2xl md:text-3xl font-bold mb-2">{localized(category, "name") || category.name}</h1>
            {localized(category, "description") && (
              <p className="text-muted-foreground mb-6 md:mb-8">{localized(category, "description")}</p>
            )}
          </>
        ) : null}

        {posts.length > 0 ? (
          <>
            <CategoryPostsMobileCarousel posts={posts} />
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {posts.map((post) => {
                const pid = post._id || post.id;
                return (
                  <PostCard key={pid} post={{ ...post, id: pid }} />
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-12 md:py-16 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("category.empty")}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;
