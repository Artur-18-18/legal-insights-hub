import { Layout } from "@/components/Layout";
import { PostCard } from "@/components/PostCard";
import { CategoryCard } from "@/components/CategoryCard";
import { categories, posts } from "@/lib/mock-data";
import { Scale, BookOpen, Search as SearchIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

const Index = () => {
  const { t } = useI18n();

  return (
    <Layout>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-12 md:pb-16">
        <h2 className="font-serif text-xl md:text-2xl font-bold mb-4 md:mb-6">{t("posts.latest")}</h2>
        {posts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {posts.filter((p) => p.published).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
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
