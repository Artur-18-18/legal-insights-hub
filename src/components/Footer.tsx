import { Link } from "react-router-dom";
import { Scale } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-gold" />
            <span className="font-serif font-bold text-foreground">{t("site.name")}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
            <Link to="/category/corporate-law" className="hover:text-foreground transition-colors">{t("cat.corporate-law")}</Link>
            <Link to="/category/taxes" className="hover:text-foreground transition-colors">{t("cat.taxes")}</Link>
            <Link to="/category/construction" className="hover:text-foreground transition-colors">{t("cat.construction")}</Link>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm text-muted-foreground">{t("footer.rights")}</p>
            <Link to="/admin/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Ismoiljon Umaraliyev</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
