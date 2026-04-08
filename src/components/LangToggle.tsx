import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function LangToggle() {
  const { lang, setLang } = useI18n();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLang(lang === "ru" ? "uz" : "ru")}
      className="text-xs font-medium px-2"
    >
      {lang === "ru" ? "UZ 🇺🇿" : "RU 🇷🇺"}
    </Button>
  );
}
