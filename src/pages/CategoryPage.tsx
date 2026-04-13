import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { BookOpen } from "lucide-react";
import { useI18n, useLocalized } from "@/lib/i18n";
import { api } from "@/lib/api";
import { getPostsByCategory } from "@/lib/mock-data";

interface Category {
  _id: string;
  name: string;
  name_uz?: string;
  slug: string;
  description: string | null;
  description_uz?: string;
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
  categories: { name: string; slug: string; icon: string | null } | null;
  post_tags: Array<{ tags: { name: string; slug: string } | null }>;
  post_images: Array<{ url: string; alt_text: string | null }>;
}

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useI18n();
  const localized = useLocalized();
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    api.getPosts()
      .then((allPosts) => {
        api.getCategories()
          .then((cats) => {
            const cat = cats.find((c: Category) => c.slug === slug);
            if (cat) {
              setCategory(cat);
              const filtered = allPosts.filter((p: Post) => p.category?.slug === slug && p.published);
              setPosts(filtered);
            } else {
              const mockData = getPostsByCategory(slug);
              if (mockData) {
                setCategory(mockData.category as unknown as Category);
                setPosts(mockData.posts as unknown as Post[]);
              }
            }
          })
          .catch(() => {
            const mockData = getPostsByCategory(slug);
            if (mockData) {
              setCategory(mockData.category as unknown as Category);
              setPosts(mockData.posts as unknown as Post[]);
            }
          })
          .finally(() => setLoading(false));
      })
      .catch(() => {
        const mockData = getPostsByCategory(slug);
        if (mockData) {
          setCategory(mockData.category as unknown as Category);
          setPosts(mockData.posts as unknown as Post[]);
        }
        setLoading(false);
      });
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
        <title>{category ? `${localized(category, "name") || category.name} — ЮристБлог` : `Категория — ЮристБлог`}</title>
        <meta name="description" content={localized(category, "description") || category?.description || `Статьи категории ${category?.name || ""}`} />
        <meta property="og:title" content={localized(category, "name") || category?.name || "Категория"} />
        <meta property="og:description" content={localized(category, "description") || category?.description || ""} />
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {posts.map((post) => (
              <PostCard key={post._id || post.id} post={{ ...post, id: post._id || post.id }} />
            ))}
          </div>
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
