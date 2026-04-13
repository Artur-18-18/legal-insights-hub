import { useEffect, useState, FormEvent } from "react";
import { api } from "@/lib/api";
import { FolderOpen, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface Category {
  id: string;
  name: string;
  name_uz?: string;
  slug: string;
  description: string | null;
  description_uz?: string;
  icon: string | null;
}

export default function CategoriesList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [nameUz, setNameUz] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionUz, setDescriptionUz] = useState("");
  const [icon, setIcon] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();

  const fetchCategories = () => {
    api.getCategories()
      .then((data) => {
        // Map MongoDB _id to id for the component
        const mapped = (data as Array<{ _id?: string; id?: string; name: string; name_uz?: string; slug: string; description?: string | null; description_uz?: string; icon?: string | null }>).map((cat) => ({
          id: cat._id || cat.id || "",
          name: cat.name,
          name_uz: cat.name_uz,
          slug: cat.slug,
          description: cat.description ?? null,
          description_uz: cat.description_uz,
          icon: cat.icon ?? null,
        }));
        setCategories(mapped);
      })
      .catch(() => toast({ title: t("admin.error"), description: "Не удалось загрузить категории", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setNameUz("");
    setSlug("");
    setDescription("");
    setDescriptionUz("");
    setIcon("");
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setNameUz(cat.name_uz || "");
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setDescriptionUz(cat.description_uz || "");
    setIcon(cat.icon || "");
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast({ title: t("admin.error"), description: "Заполните обязательные поля", variant: "destructive" });
      return;
    }
    setSaving(true);
    const body = { name, name_uz: nameUz || null, slug, description: description || null, description_uz: descriptionUz || null, icon: icon || null };
    try {
      if (editingId) {
        await api.updateCategory(editingId, body);
        toast({ title: t("admin.save"), description: "Категория обновлена" });
      } else {
        await api.createCategory(body);
        toast({ title: t("admin.save"), description: "Категория создана" });
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ошибка сохранения";
      toast({ title: t("admin.error"), description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteCategory(deleteId);
      toast({ title: t("admin.delete"), description: "Категория удалена" });
      setCategories(categories.filter((c) => c.id !== deleteId));
    } catch {
      toast({ title: t("admin.error"), description: "Не удалось удалить категорию", variant: "destructive" });
    }
    setDeleteId(null);
  };

  if (loading) return <div className="text-center py-8">{t("admin.loading")}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">{t("admin.categories_title")}</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> {t("admin.new_category_btn")}
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">{t("admin.no_categories")}</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.cat_name")}</TableHead>
                <TableHead>{t("admin.cat_slug")}</TableHead>
                <TableHead>{t("admin.cat_desc")}</TableHead>
                <TableHead>{t("admin.cat_icon")}</TableHead>
                <TableHead className="text-right">{t("admin.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{cat.slug}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{cat.description || "—"}</TableCell>
                  <TableCell className="text-sm">{cat.icon || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(cat.id)}>
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? t("admin.edit_cat") : t("admin.new_cat_dialog")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="cat-name">{t("admin.cat_name")} *</Label>
              <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="cat-name-uz">{t("admin.cat_name")} (O'zbekcha)</Label>
              <Input id="cat-name-uz" value={nameUz} onChange={(e) => setNameUz(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cat-slug">{t("admin.cat_slug")} *</Label>
              <Input id="cat-slug" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} required />
            </div>
            <div>
              <Label htmlFor="cat-desc">{t("admin.cat_desc")}</Label>
              <Textarea id="cat-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div>
              <Label htmlFor="cat-desc-uz">{t("admin.cat_desc")} (O'zbekcha)</Label>
              <Textarea id="cat-desc-uz" value={descriptionUz} onChange={(e) => setDescriptionUz(e.target.value)} rows={2} />
            </div>
            <div>
              <Label htmlFor="cat-icon">{t("admin.cat_icon")}</Label>
              <Input id="cat-icon" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Building2" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>{t("admin.cancel")}</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingId ? t("admin.save") : t("admin.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.delete_confirm_cat")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.delete_confirm_cat_desc")}
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
