import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { getPostsByTag } from "@/lib/supabase-helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const TagPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useI18n();

  const { data, isLoading } = useQuery({
    queryKey: ["tag", slug],
    queryFn: () => getPostsByTag(slug!),
    enabled: !!slug,
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-10">
        {isLoading ? (
          <Skeleton className="h-10 w-64 mb-8" />
        ) : data ? (
          <h1 className="font-serif text-2xl md:text-3xl font-bold mb-6 md:mb-8">#{data.tag.name}</h1>
        ) : null}

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
          </div>
        ) : data && data.posts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {data.posts.map((post: any) => <PostCard key={post.id} post={post} />)}
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
