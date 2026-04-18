import { useState } from "react";
import { Languages, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export type TranslateDirection =
  | "ru-to-uz"
  | "uz-to-ru"
  | "ru-to-en"
  | "en-to-ru"
  | "uz-to-en"
  | "en-to-uz";

const DIR_LANGS: Record<TranslateDirection, [string, string]> = {
  "ru-to-uz": ["ru", "uz"],
  "uz-to-ru": ["uz", "ru"],
  "ru-to-en": ["ru", "en"],
  "en-to-ru": ["en", "ru"],
  "uz-to-en": ["uz", "en"],
  "en-to-uz": ["en", "uz"],
};

const TOOLTIP_KEY: Record<TranslateDirection, string> = {
  "ru-to-uz": "translate.ru_to_uz",
  "uz-to-ru": "translate.uz_to_ru",
  "ru-to-en": "translate.ru_to_en",
  "en-to-ru": "translate.en_to_ru",
  "uz-to-en": "translate.uz_to_en",
  "en-to-uz": "translate.en_to_uz",
};

interface TranslateButtonProps {
  value: string;
  direction: TranslateDirection;
  format?: "text" | "html";
  onTranslated: (translated: string) => void;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  label?: string;
  iconOnly?: boolean;
  disabled?: boolean;
}

export function TranslateButton({
  value,
  direction,
  format = "text",
  onTranslated,
  variant = "outline",
  size = "sm",
  className,
  label,
  iconOnly = false,
  disabled = false,
}: TranslateButtonProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [source, target] = DIR_LANGS[direction];

  const handleTranslate = async () => {
    if (!value || !value.trim()) {
      toast({
        title: t("translate.error"),
        description: t("admin.fill_required"),
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { translated } = await api.translate({
        text: value,
        source: source as "ru" | "uz" | "en",
        target: target as "ru" | "uz" | "en",
        format,
      });
      onTranslated(translated);
      toast({
        title: t("translate.success"),
        description: t("translate.success_desc"),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("translate.error_desc");
      toast({
        title: t("translate.error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const tooltipText = t(TOOLTIP_KEY[direction]);

  const buttonContent = (
    <Button
      type="button"
      variant={variant}
      size={iconOnly ? "icon" : size}
      className={cn(
        "group relative overflow-hidden transition-all",
        variant === "outline" && "border-gold/40 hover:border-gold hover:bg-gold/5",
        className,
      )}
      onClick={handleTranslate}
      disabled={loading || disabled}
      aria-label={tooltipText}
    >
      {loading ? (
        <Loader2 className={cn("h-4 w-4 animate-spin", !iconOnly && "mr-2")} />
      ) : (
        <span className={cn("relative flex items-center", !iconOnly && "mr-2")}>
          <Languages className="h-4 w-4 text-gold" />
          <Sparkles className="absolute -top-1 -right-1 h-2.5 w-2.5 text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
      )}
      {!iconOnly && (
        <span className="font-medium">
          {loading ? t("translate.translating") : label || t("translate.button")}
        </span>
      )}
    </Button>
  );

  if (iconOnly) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
}
