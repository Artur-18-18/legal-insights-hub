import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, LogOut, Tag, Scale, ShieldX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { LangToggle } from "@/components/LangToggle";

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, categories(name, slug)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast({ title: "Удалено" });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  if (!user) {
    navigate("/admin/login");
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <Card className="max-w-sm w-full text-center p-8">
          <ShieldX className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold mb-2">{t("admin.noaccess")}</h2>
          <p className="text-muted-foreground text-sm mb-4">{t("admin.noaccess_desc")}</p>
          <Button variant="outline" onClick={() => navigate("/")}>{t("nav.home")}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-gold" />
              <span className="font-serif font-bold text-sm md:text-base">{t("site.name")}</span>
            </Link>
            <Badge variant="secondary" className="text-xs">{t("admin.dashboard")}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <LangToggle />
            <Link to="/admin/tags">
              <Button variant="ghost" size="sm"><Tag className="h-4 w-4 mr-1" /> {t("admin.manage_tags")}</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" /> {t("admin.logout")}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-xl md:text-2xl font-bold">{t("admin.posts")}</h1>
          <Link to="/admin/post/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> {t("admin.newpost")}
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-2">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-3 md:p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-sm md:text-base truncate">{post.title}</h3>
                      <Badge variant={post.published ? "default" : "outline"} className="text-xs shrink-0">
                        {post.published ? t("admin.published") : t("admin.draft")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {post.categories?.name} · {format(new Date(post.created_at), "d MMM yyyy", { locale: ru })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link to={`/admin/post/${post.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => {
                        if (confirm("Удалить эту статью?")) deleteMutation.mutate(post.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>{t("posts.empty")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
