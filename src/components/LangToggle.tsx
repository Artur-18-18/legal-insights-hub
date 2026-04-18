import { useI18n, type Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";

const LANG_ORDER: Lang[] = ["ru", "uz", "en"];

export function LangToggle() {
  const { lang, setLang, t } = useI18n();

  const short = { ru: "RU", uz: "UZ", en: "EN" }[lang];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs font-medium gap-1 px-2 min-h-9"
          aria-label={t("lang.switch")}
        >
          <Languages className="h-3.5 w-3.5 shrink-0" />
          <span>{short}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuRadioGroup value={lang} onValueChange={(v) => setLang(v as Lang)}>
          {LANG_ORDER.map((code) => (
            <DropdownMenuRadioItem key={code} value={code} className="cursor-pointer">
              {t(code === "ru" ? "lang.ru" : code === "uz" ? "lang.uz" : "lang.en")}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
