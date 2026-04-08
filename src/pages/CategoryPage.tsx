import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { getPostsByCategory } from "@/lib/supabase-helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["category", slug],
    queryFn: () => getPostsByCategory(slug!),
    enabled: !!slug,
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        {isLoading ? (
          <>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96 mb-8" />
          </>
        ) : data ? (
          <>
            <h1 className="font-serif text-3xl font-bold mb-2">{data.category.name}</h1>
            {data.category.description && (
              <p className="text-muted-foreground mb-8">{data.category.description}</p>
            )}
          </>
        ) : null}

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : data && data.posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>В этой категории пока нет статей</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryPage;
