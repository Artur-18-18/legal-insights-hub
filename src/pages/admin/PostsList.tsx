import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { FileText, Plus, Edit, Trash2, Eye, EyeOff, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useI18n, useLocalized } from "@/lib/i18n";

interface Post {
  id: string;
  title: string;
  title_uz?: string;
  slug: string;
  excerpt: string | null;
  published: boolean;
  created_at: string;
  category: {
    name: string;
    name_uz?: string;
    slug: string;
  } | null;
}

export default function PostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const { t, lang } = useI18n();
  const localized = useLocalized();

  const fetchPosts = () => {
    api
      .getAllPosts()
      .then((data) => {
        const mapped = (
          data as Array<{
            _id: string;
            title: string;
            title_uz?: string;
            slug: string;
            excerpt?: string;
            published?: boolean;
            created_at: string;
            category?: { name: string; name_uz?: string; slug: string } | null;
          }>
        ).map((post) => ({
          id: post._id || "",
          title: post.title,
          title_uz: post.title_uz,
          slug: post.slug,
          excerpt: post.excerpt || "",
          published: post.published || false,
          created_at: post.created_at,
          category: post.category || null,
        }));
        setPosts(mapped);
      })
      .catch(() =>
        toast({
          title: t("admin.error"),
          description: t("admin.post_load_err"),
          variant: "destructive",
        }),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deletePost(deleteId);
      toast({ title: t("admin.delete"), description: t("admin.post_deleted") });
      setPosts(posts.filter((p) => p.id !== deleteId));
    } catch {
      toast({
        title: t("admin.error"),
        description: t("admin.post_delete_err"),
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(lang === "uz" ? "uz-UZ" : "ru-RU");
    } catch {
      return iso;
    }
  };

  if (loading)
    return <div className="text-center py-8">{t("admin.loading")}</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <h1 className="text-xl sm:text-2xl font-serif font-bold">
          {t("admin.posts_title")}
        </h1>
        <Link to="/admin/posts/new" className="sm:w-auto">
          <Button className="w-full sm:w-auto">
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
        <>
          {/* Mobile: card list */}
          <div className="md:hidden space-y-3">
            {posts.map((post) => {
              const title = localized(post, "title") || post.title;
              const catName = post.category
                ? localized(post.category, "name") || post.category.name
                : null;
              return (
                <div
                  key={post.id}
                  className="bg-card border rounded-lg p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm line-clamp-2">{title}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {post.slug}
                      </p>
                    </div>
                    {post.published ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shrink-0 text-[10px]">
                        <Eye className="h-3 w-3 mr-1" />
                        {t("admin.published_badge")}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-yellow-600 shrink-0 text-[10px]"
                      >
                        <EyeOff className="h-3 w-3 mr-1" />
                        {t("admin.draft_badge")}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
                    {catName && (
                      <Badge variant="secondary" className="text-[10px]">
                        {catName}
                      </Badge>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.created_at)}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link
                      to={`/admin/posts/edit/${post.id}`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1.5" />
                        {t("admin.edit")}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => setDeleteId(post.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">
                    {t("admin.heading")}
                  </TableHead>
                  <TableHead>{t("admin.category_col")}</TableHead>
                  <TableHead>{t("admin.status")}</TableHead>
                  <TableHead>{t("admin.date")}</TableHead>
                  <TableHead className="text-right">
                    {t("admin.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => {
                  const title = localized(post, "title") || post.title;
                  const catName = post.category
                    ? localized(post.category, "name") || post.category.name
                    : null;
                  return (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[280px]">
                            {post.slug}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {catName ? (
                          <Badge variant="secondary">{catName}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {post.published ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            <Eye className="h-3 w-3 mr-1" />{" "}
                            {t("admin.published_badge")}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600">
                            <EyeOff className="h-3 w-3 mr-1" />{" "}
                            {t("admin.draft_badge")}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(post.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Link to={`/admin/posts/edit/${post.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              title={t("admin.edit")}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={t("admin.delete")}
                            onClick={() => setDeleteId(post.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <AlertDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.delete_confirm_post")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.delete_confirm_post_desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("admin.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
