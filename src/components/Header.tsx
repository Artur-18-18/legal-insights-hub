import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LangToggle } from "@/components/LangToggle";
import { useI18n } from "@/lib/i18n";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const categories = [
    { name: t("cat.corporate-law"), slug: "corporate-law" },
    { name: t("cat.corporate-governance"), slug: "corporate-governance" },
    { name: t("cat.competition-law"), slug: "competition-law" },
    { name: t("cat.taxes"), slug: "taxes" },
    { name: t("cat.construction"), slug: "construction" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Scale className="h-6 w-6 md:h-7 md:w-7 text-gold" />
            <span className="font-serif text-lg md:text-xl font-bold text-foreground">
              {t("site.name").split("Блог")[0] || "Юрист"}
              <span className="text-gold">{t("site.name").includes("Блог") ? "Блог" : "Blog"}</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="px-2 xl:px-3 py-2 text-xs xl:text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <LangToggle />
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-1">
                <Input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("search.placeholder")}
                  className="w-32 sm:w-48 md:w-64 h-9 text-sm"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => setSearchOpen(false)} className="h-9 w-9">
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="h-9 w-9">
                <Search className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {menuOpen && (
          <nav className="lg:hidden pb-4 border-t pt-2 animate-in slide-in-from-top-2">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                onClick={() => setMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
