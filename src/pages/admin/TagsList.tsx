import { useEffect, useState, FormEvent } from "react";
import { api } from "@/lib/api";
import { Tags, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface Tag {
  id: string;
  name: string;
  name_uz?: string;
  slug: string;
}

export default function TagsList() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [nameUz, setNameUz] = useState("");
  const [slug, setSlug] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();

  const fetchTags = () => {
    api.getTags()
      .then((data) => {
        const mapped = (data as Array<{ _id?: string; id?: string; name: string; name_uz?: string; slug: string }>).map((tag) => ({
          id: tag._id || tag.id || "",
          name: tag.name,
          name_uz: tag.name_uz,
          slug: tag.slug,
        }));
        setTags(mapped);
      })
      .catch(() => toast({ title: t("admin.error"), description: "Не удалось загрузить теги", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setNameUz("");
    setSlug("");
    setModalOpen(true);
  };

  const openEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setName(tag.name);
    setNameUz(tag.name_uz || "");
    setSlug(tag.slug);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast({ title: t("admin.error"), description: "Заполните обязательные поля", variant: "destructive" });
      return;
    }
    setSaving(true);
    const body = { name, name_uz: nameUz || null, slug };
    try {
      if (editingId) {
        await api.updateTag(editingId, body);
        toast({ title: t("admin.save"), description: "Тег обновлён" });
      } else {
        await api.createTag(body);
        toast({ title: t("admin.save"), description: "Тег создан" });
      }
      setModalOpen(false);
      fetchTags();
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
      await api.deleteTag(deleteId);
      toast({ title: t("admin.delete"), description: "Тег удалён" });
      setTags(tags.filter((t) => t.id !== deleteId));
    } catch {
      toast({ title: t("admin.error"), description: "Не удалось удалить тег", variant: "destructive" });
    }
    setDeleteId(null);
  };

  if (loading) return <div className="text-center py-8">{t("admin.loading")}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">{t("admin.tags_title")}</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> {t("admin.new_tag_btn")}
        </Button>
      </div>

      {tags.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <Tags className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">{t("admin.no_tags")}</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.tag_name")}</TableHead>
                <TableHead>{t("admin.tag_slug")}</TableHead>
                <TableHead className="text-right">{t("admin.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">{tag.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{tag.slug}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(tag)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(tag.id)}>
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
            <DialogTitle>{editingId ? t("admin.edit_tag") : t("admin.new_tag_dialog")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tag-name">{t("admin.tag_name")} *</Label>
              <Input id="tag-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="tag-name-uz">{t("admin.tag_name")} (O'zbekcha)</Label>
              <Input id="tag-name-uz" value={nameUz} onChange={(e) => setNameUz(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="tag-slug">{t("admin.tag_slug")} *</Label>
              <Input id="tag-slug" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} required />
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
            <AlertDialogTitle>{t("admin.delete_confirm_tag")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.delete_confirm_tag_desc")}
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
