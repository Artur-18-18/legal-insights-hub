import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { getPostsByTag } from "@/lib/supabase-helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";

const TagPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["tag", slug],
    queryFn: () => getPostsByTag(slug!),
    enabled: !!slug,
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        {isLoading ? (
          <Skeleton className="h-10 w-64 mb-8" />
        ) : data ? (
          <h1 className="font-serif text-3xl font-bold mb-8">#{data.tag.name}</h1>
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
            <p>Статей с этим тегом пока нет</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TagPage;
