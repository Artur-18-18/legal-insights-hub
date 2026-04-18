import { useEffect, useState, FormEvent } from "react";
import { api } from "@/lib/api";
import { Tags, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useI18n, useLocalized } from "@/lib/i18n";
import { TranslateButton } from "@/components/TranslateButton";

interface Tag {
  id: string;
  name: string;
  name_uz?: string;
  name_en?: string;
  slug: string;
}

export default function TagsList() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [nameUz, setNameUz] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();
  const localized = useLocalized();

  const fetchTags = () => {
    api
      .getTags()
      .then((data) => {
        const mapped = (
          data as Array<{
            _id?: string;
            id?: string;
            name: string;
            name_uz?: string;
            name_en?: string;
            slug: string;
          }>
        ).map((tag) => ({
          id: tag._id || tag.id || "",
          name: tag.name,
          name_uz: tag.name_uz,
          name_en: tag.name_en,
          slug: tag.slug,
        }));
        setTags(mapped);
      })
      .catch(() =>
        toast({
          title: t("admin.error"),
          description: t("admin.tag_load_err"),
          variant: "destructive",
        }),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setNameUz("");
    setNameEn("");
    setSlug("");
    setModalOpen(true);
  };

  const openEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setName(tag.name);
    setNameUz(tag.name_uz || "");
    setNameEn(tag.name_en || "");
    setSlug(tag.slug);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast({
        title: t("admin.error"),
        description: t("admin.fill_required"),
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const body = { name, name_uz: nameUz || null, name_en: nameEn || null, slug };
    try {
      if (editingId) {
        await api.updateTag(editingId, body);
        toast({ title: t("admin.save"), description: t("admin.tag_updated") });
      } else {
        await api.createTag(body);
        toast({ title: t("admin.save"), description: t("admin.tag_created") });
      }
      setModalOpen(false);
      fetchTags();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("admin.save_error");
      toast({ title: t("admin.error"), description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteTag(deleteId);
      toast({ title: t("admin.delete"), description: t("admin.tag_deleted") });
      setTags(tags.filter((t) => t.id !== deleteId));
    } catch {
      toast({
        title: t("admin.error"),
        description: t("admin.tag_delete_err"),
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  if (loading)
    return <div className="text-center py-8">{t("admin.loading")}</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          {t("admin.tags_title")}
        </h1>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" /> {t("admin.new_tag_btn")}
        </Button>
      </div>

      {tags.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <Tags className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">{t("admin.no_tags")}</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="bg-card border rounded-lg p-3 shadow-sm"
              >
                <p className="font-medium">
                  {localized(tag, "name") || tag.name}
                </p>
                <p className="text-xs text-muted-foreground">{tag.slug}</p>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEdit(tag)}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                    {t("admin.edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => setDeleteId(tag.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.tag_name")}</TableHead>
                  <TableHead>{t("admin.tag_slug")}</TableHead>
                  <TableHead className="text-right">
                    {t("admin.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">
                      {localized(tag, "name") || tag.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tag.slug}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(tag)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(tag.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? t("admin.edit_tag") : t("admin.new_tag_dialog")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="tag-name">{t("admin.tag_name")} *</Label>
                <TranslateButton
                  value={name}
                  direction="ru-to-uz"
                  onTranslated={setNameUz}
                  iconOnly
                  disabled={!name.trim()}
                />
              </div>
              <Input
                id="tag-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="tag-name-uz">{t("admin.tag_name_uz_label")}</Label>
              <Input
                id="tag-name-uz"
                value={nameUz}
                onChange={(e) => setNameUz(e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5 gap-1 flex-wrap">
                <Label htmlFor="tag-name-en">{t("admin.tag_name_en_label")}</Label>
                <div className="flex items-center gap-1">
                  <TranslateButton
                    value={name}
                    direction="ru-to-en"
                    onTranslated={setNameEn}
                    iconOnly
                    disabled={!name.trim()}
                  />
                  <TranslateButton
                    value={nameUz}
                    direction="uz-to-en"
                    onTranslated={setNameEn}
                    iconOnly
                    disabled={!nameUz.trim()}
                  />
                  <TranslateButton
                    value={nameEn}
                    direction="en-to-ru"
                    onTranslated={setName}
                    iconOnly
                    disabled={!nameEn.trim()}
                  />
                </div>
              </div>
              <Input
                id="tag-name-en"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tag-slug">{t("admin.tag_slug")} *</Label>
              <Input
                id="tag-slug"
                value={slug}
                onChange={(e) =>
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                }
                required
              />
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="w-full sm:w-auto"
              >
                {t("admin.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto"
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingId ? t("admin.save") : t("admin.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.delete_confirm_tag")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.delete_confirm_tag_desc")}
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
