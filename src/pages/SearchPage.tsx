import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { searchPostsMock, tags } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Tag } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const { t } = useI18n();

  const results = initialQuery ? searchPostsMock(initialQuery) : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) setSearchParams({ q: query.trim() });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-10">
        <h1 className="font-serif text-2xl md:text-3xl font-bold mb-4 md:mb-6">{t("search.title")}</h1>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6 md:mb-8 max-w-xl">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("search.placeholder")} className="flex-1" />
          <Button type="submit">
            <Search className="h-4 w-4 mr-1" /> {t("search.button")}
          </Button>
        </form>

        {tags.length > 0 && (
          <div className="mb-6 md:mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" /> {t("search.tags")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link key={tag.id} to={`/tag/${tag.slug}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-muted">#{tag.name}</Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {initialQuery && (
          <>
            <h2 className="text-base md:text-lg font-medium mb-4">
              {t("search.results")} «{initialQuery}»
            </h2>
            {results.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {results.map((post) => <PostCard key={post.id} post={post} />)}
              </div>
            ) : (
              <p className="text-muted-foreground">{t("search.nothing")}</p>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
