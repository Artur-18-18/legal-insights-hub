import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { CategoryCard } from "@/components/CategoryCard";
import { getCategories, getPosts } from "@/lib/supabase-helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { Scale, BookOpen, Search as SearchIcon } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["posts", "latest"],
    queryFn: () => getPosts({ limit: 6 }),
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="hero-gradient py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <Scale className="h-12 w-12 text-gold" />
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary-foreground mb-4">
            Юридический блог
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-6">
            Аналитика и разборы законодательства в области корпоративного права, налогов и строительства
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 bg-gold px-5 py-2.5 rounded-md text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
            >
              <SearchIcon className="h-4 w-4" /> Поиск статей
            </Link>
            <Link
              to="/category/corporate-law"
              className="inline-flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/20 px-5 py-2.5 rounded-md text-sm font-medium text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
            >
              <BookOpen className="h-4 w-4" /> Категории
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 -mt-8 relative z-10 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {catLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))
            : categories?.map((cat) => <CategoryCard key={cat.id} category={cat} />)}
        </div>
      </section>

      {/* Latest Posts */}
      <section className="container mx-auto px-4 pb-16">
        <h2 className="font-serif text-2xl font-bold mb-6">Последние публикации</h2>
        {postsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Пока нет публикаций</p>
            <p className="text-sm mt-1">Статьи скоро появятся</p>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Index;
