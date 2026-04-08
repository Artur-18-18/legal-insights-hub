import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminTags = () => {
  const { isAdmin } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const { data: tags, isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data } = await supabase.from("tags").select("*").order("name");
      return data || [];
    },
    enabled: isAdmin,
  });

  const generateSlug = (text: string) => {
    const translitMap: Record<string, string> = {
      а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
      з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
      п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
      ч: "ch", ш: "sh", щ: "shch", ы: "y", э: "e", ю: "yu", я: "ya", ъ: "", ь: "",
    };
    return text.toLowerCase().split("").map((c) => translitMap[c] || c).join("")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  };

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tags").insert({ name, slug: slug || generateSlug(name) });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setName("");
      setSlug("");
      toast({ title: "Тег добавлен" });
    },
    onError: (err: any) => toast({ variant: "destructive", title: "Ошибка", description: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast({ title: "Тег удалён" });
    },
  });

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {t("admin.dashboard")}
          </Link>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-gold" />
            <span className="font-serif font-bold text-sm">{t("site.name")}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        <h1 className="font-serif text-xl font-bold mb-6">{t("admin.manage_tags")}</h1>

        <Card className="mb-6">
          <CardContent className="p-4 space-y-3">
            <div>
              <Label>{t("admin.tagname")}</Label>
              <Input value={name} onChange={(e) => { setName(e.target.value); setSlug(generateSlug(e.target.value)); }} />
            </div>
            <div>
              <Label>{t("admin.tagslug")}</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <Button size="sm" onClick={() => addMutation.mutate()} disabled={!name || addMutation.isPending}>
              <Plus className="h-4 w-4 mr-1" /> {t("admin.newtag")}
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          {tags?.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="gap-1 pr-1">
              #{tag.name}
              <button
                onClick={() => { if (confirm("Удалить тег?")) deleteMutation.mutate(tag.id); }}
                className="ml-1 text-destructive hover:text-destructive/80"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminTags;
