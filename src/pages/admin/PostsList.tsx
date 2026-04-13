import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { FileText, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published: boolean;
  created_at: string;
  categories: { name: string; slug: string } | null;
}

export default function PostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useI18n();

  const fetchPosts = () => {
    api.getAllPosts()
      .then((data) => {
        const mapped = (data as Array<{ _id?: string; id?: string; title: string; slug: string; excerpt: string | null; published: boolean; created_at: string; category?: { name: string; slug: string } | null; categories?: { name: string; slug: string } | null }>).map((post) => ({
          id: post._id || post.id || "",
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          published: post.published,
          created_at: post.created_at,
          categories: post.categories || post.category || null,
        }));
        setPosts(mapped);
      })
      .catch(() => toast({ title: t("admin.error"), description: "Не удалось загрузить статьи", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deletePost(deleteId);
      toast({ title: t("admin.delete"), description: "Статья удалена" });
      setPosts(posts.filter((p) => p.id !== deleteId));
    } catch {
      toast({ title: t("admin.error"), description: "Не удалось удалить статью", variant: "destructive" });
    }
    setDeleteId(null);
  };

  if (loading) return <div className="text-center py-8">{t("admin.loading")}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">{t("admin.posts_title")}</h1>
        <Link to="/admin/posts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> {t("admin.new_post_btn")}
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-2">{t("admin.no_posts")}</p>
          <Link to="/admin/posts/new">
            <Button variant="outline">{t("admin.create_first_post")}</Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">{t("admin.heading")}</TableHead>
                <TableHead>{t("admin.category_col")}</TableHead>
                <TableHead>{t("admin.status")}</TableHead>
                <TableHead>{t("admin.date")}</TableHead>
                <TableHead className="text-right">{t("admin.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{post.title}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[250px]">{post.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.categories ? (
                      <Badge variant="secondary">{post.categories.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {post.published ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <Eye className="h-3 w-3 mr-1" /> {t("admin.published_badge")}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600">
                        <EyeOff className="h-3 w-3 mr-1" /> {t("admin.draft_badge")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString("ru-RU")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/posts/edit/${post.id}`}>
                        <Button variant="ghost" size="icon" title={t("admin.edit")}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" title={t("admin.delete")} onClick={() => setDeleteId(post.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.delete_confirm_post")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.delete_confirm_post_desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("admin.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
