import { useState } from "react";
import { Languages, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export type TranslateDirection = "ru-to-uz" | "uz-to-ru";

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

  const [source, target] = direction === "ru-to-uz" ? ["ru", "uz"] : ["uz", "ru"];

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
        source: source as "ru" | "uz",
        target: target as "ru" | "uz",
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

  const tooltipText = direction === "ru-to-uz"
    ? t("translate.ru_to_uz")
    : t("translate.uz_to_ru");

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
