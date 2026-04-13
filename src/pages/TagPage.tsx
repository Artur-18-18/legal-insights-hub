import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { getPostsByTag } from "@/lib/mock-data";
import { BookOpen } from "lucide-react";
import { useI18n, useLocalized } from "@/lib/i18n";
import { api } from "@/lib/api";

interface Tag {
  _id: string;
  name: string;
  name_uz?: string;
  slug: string;
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

const TagPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useI18n();
  const localized = useLocalized();
  const [posts, setPosts] = useState<Post[]>([]);
  const [tag, setTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    api.getPosts()
      .then((allPosts) => {
        api.getTags()
          .then((allTags) => {
            const foundTag = allTags.find((t: Tag) => t.slug === slug);
            if (foundTag) {
              setTag(foundTag);
              const filtered = allPosts.filter(
                (p: Post) =>
                  p.published &&
                  p.tags?.some((t: Tag) => t.slug === slug)
              );
              setPosts(filtered);
            } else {
              const mockData = getPostsByTag(slug);
              if (mockData) {
                setTag(mockData.tag as unknown as Tag);
                setPosts(mockData.posts as unknown as Post[]);
              }
            }
          })
          .catch(() => {
            const mockData = getPostsByTag(slug);
            if (mockData) {
              setTag(mockData.tag as unknown as Tag);
              setPosts(mockData.posts as unknown as Post[]);
            }
          })
          .finally(() => setLoading(false));
      })
      .catch(() => {
        const mockData = getPostsByTag(slug);
        if (mockData) {
          setTag(mockData.tag as unknown as Tag);
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
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{tag ? `#${localized(tag, "name") || tag.name} — ЮристБлог` : `Тег — ЮристБлог`}</title>
        <meta name="description" content={`Статьи с тегом ${localized(tag, "name") || tag?.name || ""}`} />
        <meta property="og:title" content={`#${localized(tag, "name") || tag?.name || "Тег"}`} />
        <meta property="og:description" content={`Статьи с тегом ${localized(tag, "name") || tag?.name || ""}`} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${typeof window !== "undefined" ? window.location.origin : ""}/tag/${slug}`} />
      </Helmet>
      <div className="container mx-auto px-4 py-8 md:py-10">
        {tag ? (
          <h1 className="font-serif text-2xl md:text-3xl font-bold mb-6 md:mb-8">#{localized(tag, "name") || tag.name}</h1>
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
            <p>{t("tag.empty")}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TagPage;
