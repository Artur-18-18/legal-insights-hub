import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { searchPosts, getTags } from "@/lib/supabase-helpers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Tag } from "lucide-react";
import { Link } from "react-router-dom";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", initialQuery],
    queryFn: () => searchPosts(initialQuery),
    enabled: !!initialQuery,
  });

  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="font-serif text-3xl font-bold mb-6">Поиск статей</h1>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-xl">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Введите запрос..."
            className="flex-1"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-1" /> Найти
          </Button>
        </form>

        {/* Tags cloud */}
        {tags && tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" /> Теги
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link key={tag.id} to={`/tag/${tag.slug}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                    #{tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {initialQuery && (
          <>
            <h2 className="text-lg font-medium mb-4">
              Результаты по запросу «{initialQuery}»
            </h2>
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            ) : results && results.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Ничего не найдено</p>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
