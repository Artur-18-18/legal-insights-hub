import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Scale } from "lucide-react";
import { useI18n, useLocalized } from "@/lib/i18n";
import { api } from "@/lib/api";

interface FooterCategory {
  _id?: string;
  id?: string;
  name: string;
  name_uz?: string;
  slug: string;
}

export function Footer() {
  const { t } = useI18n();
  const localized = useLocalized();
  const [categories, setCategories] = useState<FooterCategory[]>([]);

  useEffect(() => {
    api
      .getCategories()
      .then((data) => setCategories((data as FooterCategory[]).slice(0, 5)))
      .catch(() => setCategories([]));
  }, []);

  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-gold" />
            <span className="font-serif font-bold text-foreground">
              {t("site.name")}
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-3 md:gap-6 text-sm text-muted-foreground">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {localized(cat, "name") || cat.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm text-muted-foreground">{t("footer.rights")}</p>
            <Link
              to="https://t.me/Ismoiljon_28"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
             Ismoiljon Umaraliyev
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
