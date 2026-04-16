import { useState, useEffect, FormEvent, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import {
  Save,
  X,
  Plus,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Upload,
  Video,
  Sparkles,
} from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useI18n, useLocalized } from "@/lib/i18n";
import { TranslateButton } from "@/components/TranslateButton";
import { cn } from "@/lib/utils";

interface Category {
  _id: string;
  name: string;
  name_uz?: string;
  slug: string;
}

interface Tag {
  _id: string;
  name: string;
  name_uz?: string;
  slug: string;
}

interface PostResponse {
  _id: string;
  title: string;
  title_uz?: string;
  slug: string;
  excerpt?: string;
  excerpt_uz?: string;
  content: string;
  content_uz?: string;
  author_name?: string;
  published: boolean;
  category?: string | Category;
  tags?: (string | Tag)[];
  legislation_links?: { title: string; url: string }[];
  post_images?: { id: string; url: string; alt_text: string | null; sort_order: number }[];
  post_videos?: { id: string; url: string; alt_text: string | null }[];
}

export default function PostForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();
  const localized = useLocalized();

  const [title, setTitle] = useState("");
  const [titleUz, setTitleUz] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [excerptUz, setExcerptUz] = useState("");
  const [content, setContent] = useState("");
  const [contentUz, setContentUz] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [published, setPublished] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [legislationLinks, setLegislationLinks] = useState<
    { title: string; url: string }[]
  >([]);
  const [postImages, setPostImages] = useState<
    Array<{ id: string; url: string; alt_text: string | null; sort_order: number }>
  >([]);
  const [postVideos, setPostVideos] = useState<
    Array<{ id: string; url: string; alt_text: string | null }>
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [translatingAll, setTranslatingAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["blockquote", "code-block"],
      ["link"],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "align",
    "blockquote",
    "code-block",
    "link",
    "color",
    "background",
  ];

  useEffect(() => {
    Promise.all([api.getCategories(), api.getTags()])
      .then(([cats, tagsData]) => {
        setCategories(cats as unknown as Category[]);
        setTags(tagsData as unknown as Tag[]);
      })
      .catch(() =>
        toast({
          title: t("admin.error"),
          description: t("admin.failed_load_cats_tags"),
          variant: "destructive",
        }),
      );

    if (isEdit) {
      api
        .getPostForAdmin(id!)
        .then((post: PostResponse) => {
          if (post) {
            setTitle(post.title || "");
            setTitleUz(post.title_uz || "");
            setSlug(post.slug || "");
            setExcerpt(post.excerpt || "");
            setExcerptUz(post.excerpt_uz || "");
            setContent(post.content || "");
            setContentUz(post.content_uz || "");
            setAuthorName(post.author_name || "Автор");
            setPublished(post.published || false);

            const catId = typeof post.category === "object" ? post.category?._id : post.category;
            setCategoryId(catId || "");

            setSelectedTags(
              post.tags?.map((tag) => (typeof tag === "string" ? tag : tag._id)) || [],
            );
            setLegislationLinks(post.legislation_links || []);
            setPostImages(post.post_images || []);
            setPostVideos(post.post_videos || []);
          }
        })
        .catch(() =>
          toast({
            title: t("admin.error"),
            description: t("admin.failed_load_post"),
            variant: "destructive",
          }),
        )
        .finally(() => setFetching(false));
    } else {
      setFetching(false);
    }
  }, [id, isEdit]);

  const generateSlug = () => {
    if (!slug && title) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[а-яё]/g, (c) => {
            const map: Record<string, string> = {
              а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
              ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
              н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
              ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch",
              ь: "", ы: "y", ъ: "", э: "e", ю: "yu", я: "ya",
            };
            return map[c] || c;
          })
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, ""),
      );
    }
  };

  const addLegislationLink = () =>
    setLegislationLinks([...legislationLinks, { title: "", url: "" }]);

  const updateLegislationLink = (index: number, field: "title" | "url", value: string) => {
    const updated = [...legislationLinks];
    updated[index] = { ...updated[index], [field]: value };
    setLegislationLinks(updated);
  };

  const removeLegislationLink = (index: number) =>
    setLegislationLinks(legislationLinks.filter((_, i) => i !== index));

  const toggleTag = (tagId: string) => {
    setSelectedTags(
      selectedTags.includes(tagId)
        ? selectedTags.filter((t) => t !== tagId)
        : [...selectedTags, tagId],
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        const newImage = {
          id: Math.random().toString(36).substring(2, 11),
          url,
          alt_text: null,
          sort_order: postImages.length,
        };
        setPostImages((prev) => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (id: string) => {
    setPostImages(postImages.filter((img) => img.id !== id));
  };

  const updateImageAlt = (id: string, alt: string) => {
    setPostImages(postImages.map((img) => (img.id === id ? { ...img, alt_text: alt } : img)));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        const newVideo = {
          id: Math.random().toString(36).substring(2, 11),
          url,
          alt_text: null,
        };
        setPostVideos((prev) => [...prev, newVideo]);
      };
      reader.readAsDataURL(file);
    });

    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const removeVideo = (id: string) => {
    setPostVideos(postVideos.filter((vid) => vid.id !== id));
  };

  const updateVideoAlt = (id: string, alt: string) => {
    setPostVideos(postVideos.map((vid) => (vid.id === id ? { ...vid, alt_text: alt } : vid)));
  };

  const translateAllRuToUz = async () => {
    if (!title.trim() && !excerpt.trim() && !content.trim()) {
      toast({
        title: t("translate.error"),
        description: t("admin.fill_required"),
        variant: "destructive",
      });
      return;
    }
    setTranslatingAll(true);
    try {
      const items: Array<{ text: string; format?: "text" | "html"; field: string }> = [];
      if (title.trim()) items.push({ text: title, field: "title", format: "text" });
      if (excerpt.trim()) items.push({ text: excerpt, field: "excerpt", format: "text" });
      if (content.trim()) items.push({ text: content, field: "content", format: "html" });

      const { results } = await api.translateBatch({
        items,
        source: "ru",
        target: "uz",
      });

      for (const r of results) {
        if (r.error || !r.translated) continue;
        if (r.field === "title") setTitleUz(r.translated);
        if (r.field === "excerpt") setExcerptUz(r.translated);
        if (r.field === "content") setContentUz(r.translated);
      }
      toast({
        title: t("translate.success"),
        description: t("translate.success_desc"),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("translate.error_desc");
      toast({ title: t("translate.error"), description: msg, variant: "destructive" });
    } finally {
      setTranslatingAll(false);
    }
  };

  const autoTranslateMissing = async () => {
    const items: Array<{ text: string; format?: "text" | "html"; field: string }> = [];
    if (title.trim() && !titleUz.trim()) items.push({ text: title, field: "title" });
    if (excerpt.trim() && !excerptUz.trim()) items.push({ text: excerpt, field: "excerpt" });
    if (content.trim() && !contentUz.trim())
      items.push({ text: content, field: "content", format: "html" });

    if (items.length === 0) return { title_uz: titleUz, excerpt_uz: excerptUz, content_uz: contentUz };

    try {
      const { results } = await api.translateBatch({ items, source: "ru", target: "uz" });
      const out = { title_uz: titleUz, excerpt_uz: excerptUz, content_uz: contentUz };
      for (const r of results) {
        if (r.error || !r.translated) continue;
        if (r.field === "title") out.title_uz = r.translated;
        if (r.field === "excerpt") out.excerpt_uz = r.translated;
        if (r.field === "content") out.content_uz = r.translated;
      }
      setTitleUz(out.title_uz);
      setExcerptUz(out.excerpt_uz);
      setContentUz(out.content_uz);
      return out;
    } catch {
      return { title_uz: titleUz, excerpt_uz: excerptUz, content_uz: contentUz };
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) {
      toast({
        title: t("admin.error"),
        description: t("admin.fill_required"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    let finalTitleUz = titleUz;
    let finalExcerptUz = excerptUz;
    let finalContentUz = contentUz;

    if (autoTranslate && published) {
      const out = await autoTranslateMissing();
      finalTitleUz = out.title_uz;
      finalExcerptUz = out.excerpt_uz;
      finalContentUz = out.content_uz;
    }

    const body = {
      title,
      title_uz: finalTitleUz || null,
      slug,
      excerpt: excerpt || null,
      excerpt_uz: finalExcerptUz || null,
      content,
      content_uz: finalContentUz || null,
      author_name: authorName,
      published,
      category: categoryId || null,
      tags: selectedTags,
      legislation_links: legislationLinks.filter((l) => l.title && l.url),
      post_images: postImages,
      post_videos: postVideos,
    };

    try {
      if (isEdit) {
        await api.updatePost(id!, body);
        toast({ title: t("admin.success"), description: t("admin.post_updated") });
      } else {
        await api.createPost(body);
        toast({ title: t("admin.success"), description: t("admin.post_created") });
      }
      navigate("/admin/posts");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("admin.save_error");
      toast({ title: t("admin.error"), description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return <div className="text-center py-8">{t("admin.loading")}</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-serif font-bold">
          {isEdit ? t("admin.edit_article") : t("admin.new_article")}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/posts")}
            className="flex-1 sm:flex-none"
          >
            <X className="h-4 w-4 mr-2" /> {t("admin.cancel")}
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex-1 sm:flex-none bg-gradient-to-r from-gold to-amber-500 hover:opacity-90 text-accent-foreground"
            onClick={translateAllRuToUz}
            disabled={translatingAll}
          >
            {translatingAll ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {translatingAll ? t("translate.translating") : t("translate.all_fields")}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">
                  {t("admin.basic_info")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label htmlFor="title">{t("admin.title")} *</Label>
                        <TranslateButton
                          value={title}
                          direction="ru-to-uz"
                          onTranslated={(v) => setTitleUz(v)}
                          iconOnly
                          disabled={!title.trim()}
                        />
                      </div>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={generateSlug}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="slug">{t("admin.slug")} *</Label>
                      <Input
                        id="slug"
                        value={slug}
                        onChange={(e) =>
                          setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                        }
                        required
                        placeholder={t("admin.slug_placeholder")}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label htmlFor="excerpt">{t("admin.excerpt")}</Label>
                        <TranslateButton
                          value={excerpt}
                          direction="ru-to-uz"
                          onTranslated={(v) => setExcerptUz(v)}
                          iconOnly
                          disabled={!excerpt.trim()}
                        />
                      </div>
                      <Textarea
                        id="excerpt"
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label htmlFor="content">{t("admin.content")} *</Label>
                        <TranslateButton
                          value={content}
                          direction="ru-to-uz"
                          format="html"
                          onTranslated={(v) => setContentUz(v)}
                          iconOnly
                          disabled={!content.replace(/<[^>]*>/g, "").trim()}
                        />
                      </div>
                      <div className="min-h-[240px] md:min-h-[320px] bg-white rounded-md border">
                        <ReactQuill
                          theme="snow"
                          value={content}
                          onChange={(value) => setContent(value)}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder={t("admin.content_placeholder")}
                          className="quill-editor"
                        />
                      </div>
                    </div>
                </div>

                <Separator className="my-2" />

                <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label htmlFor="title-uz">
                          {t("admin.title_uz_label")}
                        </Label>
                        <TranslateButton
                          value={titleUz}
                          direction="uz-to-ru"
                          onTranslated={(v) => setTitle(v)}
                          iconOnly
                          disabled={!titleUz.trim()}
                        />
                      </div>
                      <Input
                        id="title-uz"
                        value={titleUz}
                        onChange={(e) => setTitleUz(e.target.value)}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label htmlFor="excerpt-uz">
                          {t("admin.excerpt_uz_label")}
                        </Label>
                        <TranslateButton
                          value={excerptUz}
                          direction="uz-to-ru"
                          onTranslated={(v) => setExcerpt(v)}
                          iconOnly
                          disabled={!excerptUz.trim()}
                        />
                      </div>
                      <Textarea
                        id="excerpt-uz"
                        value={excerptUz}
                        onChange={(e) => setExcerptUz(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label htmlFor="content-uz">
                          {t("admin.content_uz_label")}
                        </Label>
                        <TranslateButton
                          value={contentUz}
                          direction="uz-to-ru"
                          format="html"
                          onTranslated={(v) => setContent(v)}
                          iconOnly
                          disabled={!contentUz.replace(/<[^>]*>/g, "").trim()}
                        />
                      </div>
                      <div className="min-h-[240px] md:min-h-[320px] bg-white rounded-md border">
                        <ReactQuill
                          theme="snow"
                          value={contentUz}
                          onChange={(value) => setContentUz(value)}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder={t("admin.content_placeholder_uz")}
                          className="quill-editor"
                        />
                      </div>
                    </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">
                  {t("admin.legislation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {legislationLinks.map((link, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row gap-2 sm:items-start"
                  >
                    <Input
                      value={link.title}
                      onChange={(e) => updateLegislationLink(i, "title", e.target.value)}
                      placeholder={t("admin.linktitle")}
                      className="flex-1"
                    />
                    <Input
                      value={link.url}
                      onChange={(e) => updateLegislationLink(i, "url", e.target.value)}
                      placeholder={t("admin.linkurl")}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLegislationLink(i)}
                      className="self-end sm:self-start"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLegislationLink}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" /> {t("admin.addlink")}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <ImageIcon className="h-5 w-5" /> {t("admin.images")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto"
                >
                  <Upload className="h-4 w-4 mr-2" /> {t("admin.upload")}
                </Button>

                {postImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {postImages.map((img) => (
                      <div
                        key={img.id}
                        className="relative group border rounded-lg overflow-hidden"
                      >
                        <img
                          src={img.url}
                          alt={img.alt_text || ""}
                          className="w-full h-28 object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-7 w-7"
                          onClick={() => removeImage(img.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Input
                          value={img.alt_text || ""}
                          onChange={(e) => updateImageAlt(img.id, e.target.value)}
                          placeholder={t("admin.description_alt")}
                          className="text-xs border-0 rounded-none h-8 px-2"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Video className="h-5 w-5" /> {t("admin.videos")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={handleVideoUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full sm:w-auto"
                >
                  <Upload className="h-4 w-4 mr-2" /> {t("admin.upload_video")}
                </Button>

                {postVideos.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {postVideos.map((vid) => (
                      <div
                        key={vid.id}
                        className="relative group border rounded-lg overflow-hidden"
                      >
                        <video src={vid.url} className="w-full h-32 object-cover" muted />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-7 w-7"
                          onClick={() => removeVideo(vid.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Input
                          value={vid.alt_text || ""}
                          onChange={(e) => updateVideoAlt(vid.id, e.target.value)}
                          placeholder={t("admin.description_alt")}
                          className="text-xs border-0 rounded-none h-8 px-2"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">
                  {t("admin.published")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="published"
                    checked={published}
                    onCheckedChange={(v) => setPublished(!!v)}
                  />
                  <Label htmlFor="published" className="cursor-pointer">
                    {t("admin.published")}
                  </Label>
                </div>
                <div
                  className={cn(
                    "rounded-md border p-3 space-y-2 transition-opacity",
                    !published && "opacity-50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="auto-translate"
                      checked={autoTranslate}
                      onCheckedChange={(v) => setAutoTranslate(!!v)}
                      disabled={!published}
                    />
                    <Label
                      htmlFor="auto-translate"
                      className="cursor-pointer text-sm font-medium flex items-center gap-1"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-gold" />
                      {t("translate.auto_on_save")}
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">
                    {t("translate.auto_hint")}
                  </p>
                </div>
                <div>
                  <Label htmlFor="author">{t("admin.author")}</Label>
                  <Input
                    id="author"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">
                  {t("admin.category")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={categoryId || "none"}
                  onValueChange={(v) => setCategoryId(v === "none" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("admin.choose_category")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("admin.no_category")}</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {localized(cat, "name") || cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">
                  {t("admin.tags")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag._id}
                      variant={selectedTags.includes(tag._id) ? "default" : "outline"}
                      className="cursor-pointer select-none text-sm py-1 px-3"
                      onClick={() => toggleTag(tag._id)}
                    >
                      {localized(tag, "name") || tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading || translatingAll}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEdit ? t("admin.save") : t("admin.create_article")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
