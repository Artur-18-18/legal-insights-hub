import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LangToggle } from "@/components/LangToggle";
import { useI18n, useLocalized } from "@/lib/i18n";
import { api } from "@/lib/api";

interface CategoryItem {
  _id?: string;
  id?: string;
  name: string;
  name_uz?: string;
  slug: string;
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const navigate = useNavigate();
  const { t } = useI18n();
  const localized = useLocalized();

  useEffect(() => {
    api
      .getCategories()
      .then((data) => setCategories(data as CategoryItem[]))
      .catch(() => setCategories([]));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const displayCategories = categories.slice(0, 5);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 md:h-16 gap-2">
          <Link to="/" className="flex items-center gap-2 shrink-0 min-w-0">
            <Scale className="h-6 w-6 md:h-7 md:w-7 text-gold shrink-0" />
            <span className="font-serif text-base sm:text-lg md:text-xl font-bold text-foreground truncate">
              {t("site.name")}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 min-w-0 flex-1 justify-center">
            {displayCategories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted whitespace-nowrap"
              >
                {localized(cat, "name") || cat.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 shrink-0">
            <LangToggle />
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-1">
                <Input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("search.placeholder")}
                  className="w-28 sm:w-48 md:w-64 h-9 text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(false)}
                  className="h-9 w-9"
                  aria-label={t("actions.close")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="h-9 w-9"
                aria-label={t("search.button")}
              >
                <Search className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={t("admin.menu")}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {menuOpen && (
          <nav className="lg:hidden pb-3 border-t pt-2 animate-in slide-in-from-top-2">
            {displayCategories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                onClick={() => setMenuOpen(false)}
              >
                {localized(cat, "name") || cat.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
