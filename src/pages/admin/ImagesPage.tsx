import { useState, FormEvent, ChangeEvent } from "react";
import { Image as ImageIcon, Upload, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";

interface ImageItem {
  id: string;
  url: string;
  alt_text: string;
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageItem[]>(() => {
    const saved = localStorage.getItem("admin_images");
    return saved ? JSON.parse(saved) : [];
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useI18n();

  const saveImages = (imgs: ImageItem[]) => {
    setImages(imgs);
    localStorage.setItem("admin_images", JSON.stringify(imgs));
  };

  const handleAddUrl = (e: FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;
    const newImage: ImageItem = {
      id: Date.now().toString(),
      url: imageUrl,
      alt_text: altText || "",
    };
    const updated = [newImage, ...images];
    saveImages(updated);
    setImageUrl("");
    setAltText("");
    setModalOpen(false);
    toast({ title: t("admin.save"), description: "Изображение добавлено" });
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: t("admin.error"), description: "Выберите файл изображения", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const newImage: ImageItem = {
        id: Date.now().toString(),
        url,
        alt_text: file.name.replace(/\.[^.]+$/, ""),
      };
      const updated = [newImage, ...images];
      saveImages(updated);
      toast({ title: t("admin.save"), description: "Изображение загружено" });
    };
    reader.readAsDataURL(file);
  };

  const deleteImage = (id: string) => {
    saveImages(images.filter((img) => img.id !== id));
    toast({ title: t("admin.delete"), description: "Изображение удалено" });
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Скопировано", description: "URL скопирован в буфер обмена" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">{t("admin.images")}</h1>
        <div className="flex gap-2">
          <label>
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" /> {t("admin.upload")}
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </span>
            </Button>
          </label>
          <Button onClick={() => setModalOpen(true)}>
            <ImageIcon className="h-4 w-4 mr-2" /> Добавить URL
          </Button>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground mb-2">Изображений пока нет</p>
          <p className="text-sm text-muted-foreground">Загрузите файл или добавьте URL</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {images.map((img) => (
            <Card key={img.id} className="overflow-hidden group">
              <div className="aspect-square bg-muted flex items-center justify-center relative">
                <img src={img.url} alt={img.alt_text} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button variant="secondary" size="icon" onClick={() => copyUrl(img.url, img.id)}>
                    {copiedId === img.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => deleteImage(img.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground truncate">{img.alt_text || "Без описания"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить изображение по URL</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUrl} className="space-y-4">
            <div>
              <Label htmlFor="img-url">URL изображения *</Label>
              <Input id="img-url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" required />
            </div>
            <div>
              <Label htmlFor="img-alt">Описание (alt)</Label>
              <Textarea id="img-alt" value={altText} onChange={(e) => setAltText(e.target.value)} rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>{t("admin.cancel")}</Button>
              <Button type="submit">{t("admin.create")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
