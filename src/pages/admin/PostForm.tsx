import { useState, useEffect, FormEvent, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Save, X, Plus, Trash2, Loader2, Image as ImageIcon, Upload, Video } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n, useLocalized } from "@/lib/i18n";

interface Category {
  id: string;
  name: string;
  name_uz?: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  name_uz?: string;
  slug: string;
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
  const [categoryId, setCategoryId] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [legislationLinks, setLegislationLinks] = useState<{ title: string; url: string }[]>([]);
  const [postImages, setPostImages] = useState<Array<{ id: string; url: string; alt_text: string | null; sort_order: number }>>([]);
  const [postVideos, setPostVideos] = useState<Array<{ id: string; url: string; alt_text: string | null }>>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const quillRef = useRef<ReactQuill>(null);

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold", "italic", "underline", "strike",
    "list", "bullet",
    "indent",
    "align",
    "blockquote", "code-block",
    "link", "image", "video",
    "color", "background",
  ];

  useEffect(() => {
    Promise.all([api.getCategories(), api.getTags()])
      .then(([cats, tagsData]) => {
        setCategories(cats);
        setTags(tagsData);
      })
      .catch(() => toast({ title: t("admin.error"), description: t("admin.failed_load_cats_tags"), variant: "destructive" }));

    if (isEdit) {
      api.getAllPosts()
        .then((posts: unknown[]) => {
          const post = (posts as Array<{ id: string; title: string; title_uz?: string; slug: string; excerpt: string | null; excerpt_uz?: string; content: string; content_uz?: string; author_name: string; published: boolean; category_id: string | null; post_tags: Array<{ tags: { id: string; name: string; slug: string } | null }>; legislation_links: Array<{ title: string; url: string }>; post_images: Array<{ id: string; url: string; alt_text: string | null; sort_order: number }> }>).find((p) => p.id === id);
          if (post) {
            setTitle(post.title);
            setTitleUz(post.title_uz || "");
            setSlug(post.slug);
            setExcerpt(post.excerpt || "");
            setExcerptUz(post.excerpt_uz || "");
            setContent(post.content);
            setContentUz(post.content_uz || "");
            setAuthorName(post.author_name);
            setPublished(post.published);
            setCategoryId(post.category_id || "");
            setSelectedTags(post.post_tags.filter((pt) => pt.tags).map((pt) => pt.tags!.id));
            setLegislationLinks(post.legislation_links || []);
            setPostImages(post.post_images || []);
            setPostVideos((post as Record<string, unknown>).post_videos as Array<{ id: string; url: string; alt_text: string | null }> || []);
          }
        })
        .catch(() => toast({ title: t("admin.error"), description: t("admin.failed_load_post"), variant: "destructive" }))
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
            const map: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ь: "", ы: "y", ъ: "", э: "e", ю: "yu", я: "ya" };
            return map[c] || c;
          })
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  };

  const addLegislationLink = () => setLegislationLinks([...legislationLinks, { title: "", url: "" }]);

  const updateLegislationLink = (index: number, field: "title" | "url", value: string) => {
    const updated = [...legislationLinks];
    updated[index] = { ...updated[index], [field]: value };
    setLegislationLinks(updated);
  };

  const removeLegislationLink = (index: number) => setLegislationLinks(legislationLinks.filter((_, i) => i !== index));

  const toggleTag = (tagId: string) => {
    setSelectedTags(selectedTags.includes(tagId) ? selectedTags.filter((t) => t !== tagId) : [...selectedTags, tagId]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        const newImage = {
          id: Math.random().toString(36).substr(2, 9),
          url,
          alt_text: null,
          sort_order: postImages.length,
        };
        setPostImages((prev) => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
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
          id: Math.random().toString(36).substr(2, 9),
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) {
      toast({ title: t("admin.error"), description: t("admin.fill_required"), variant: "destructive" });
      return;
    }

    setLoading(true);

    // Find selected category info
    const selectedCat = categories.find((c) => c.id === categoryId);

    // Build post_tags from selected tag IDs
    const postTags = selectedTags
      .map((tagId) => {
        const tag = tags.find((t) => t.id === tagId);
        return tag ? { tags: { name: tag.name, slug: tag.slug } } : { tags: null };
      })
      .filter((pt) => pt.tags !== null);

    const body = {
      title,
      title_uz: titleUz || null,
      slug,
      excerpt: excerpt || null,
      excerpt_uz: excerptUz || null,
      content,
      content_uz: contentUz || null,
      author_name: authorName,
      published,
      category_id: categoryId || null,
      categories: selectedCat ? { name: selectedCat.name, slug: selectedCat.slug, icon: null } : null,
      post_tags: postTags,
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

  if (fetching) return <div className="text-center py-8">{t("admin.loading")}...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">{isEdit ? t("admin.edit_article") : t("admin.new_article")}</h1>
        <Button variant="outline" onClick={() => navigate("/admin/posts")}>
          <X className="h-4 w-4 mr-2" /> {t("admin.cancel")}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.basic_info")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">{t("admin.title")} *</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={generateSlug} required />
                </div>
                <div>
                  <Label htmlFor="title-uz">{t("admin.title")} (O'zbekcha)</Label>
                  <Input id="title-uz" value={titleUz} onChange={(e) => setTitleUz(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="slug">{t("admin.slug")} *</Label>
                  <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} required placeholder="osnovy-korporativnogo-prava" />
                </div>
                <div>
                  <Label htmlFor="excerpt">{t("admin.excerpt")}</Label>
                  <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} />
                </div>
                <div>
                  <Label htmlFor="excerpt-uz">{t("admin.excerpt")} (O'zbekcha)</Label>
                  <Textarea id="excerpt-uz" value={excerptUz} onChange={(e) => setExcerptUz(e.target.value)} rows={2} />
                </div>
                <div>
                  <Label htmlFor="content">{t("admin.content")} *</Label>
                  <div className="min-h-[300px] bg-white">
                    <ReactQuill
                      ref={quillRef}
                      theme="snow"
                      value={content}
                      onChange={(value) => setContent(value)}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Напишите содержание статьи..."
                      className="bg-white"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="content-uz">{t("admin.content")} (O'zbekcha)</Label>
                  <div className="min-h-[300px] bg-white">
                    <ReactQuill
                      theme="snow"
                      value={contentUz}
                      onChange={(value) => setContentUz(value)}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Maqola mazmunini yozing..."
                      className="bg-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("admin.legislation")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {legislationLinks.map((link, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <Input value={link.title} onChange={(e) => updateLegislationLink(i, "title", e.target.value)} placeholder={t("admin.linktitle")} className="flex-1" />
                    <Input value={link.url} onChange={(e) => updateLegislationLink(i, "url", e.target.value)} placeholder={t("admin.linkurl")} className="flex-1" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeLegislationLink(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addLegislationLink}>
                  <Plus className="h-4 w-4 mr-2" /> {t("admin.addlink")}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" /> {t("admin.images")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
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
                  >
                    <Upload className="h-4 w-4 mr-2" /> {t("admin.upload")}
                  </Button>
                </div>

                {postImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {postImages.map((img) => (
                      <div key={img.id} className="relative group border rounded-lg overflow-hidden">
                        <img src={img.url} alt={img.alt_text || ""} className="w-full h-28 object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(img.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <Input
                          value={img.alt_text || ""}
                          onChange={(e) => updateImageAlt(img.id, e.target.value)}
                          placeholder={t("admin.description_alt")}
                          className="text-xs border-0 rounded-none h-7 px-2"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" /> {t("admin.video")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
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
                  >
                    <Upload className="h-4 w-4 mr-2" /> {t("admin.upload_video")}
                  </Button>
                </div>

                {postVideos.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {postVideos.map((vid) => (
                      <div key={vid.id} className="relative group border rounded-lg overflow-hidden">
                        <video src={vid.url} className="w-full h-28 object-cover" muted />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeVideo(vid.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <Input
                          value={vid.alt_text || ""}
                          onChange={(e) => updateVideoAlt(vid.id, e.target.value)}
                          placeholder={t("admin.description_alt")}
                          className="text-xs border-0 rounded-none h-7 px-2"
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
              <CardHeader>
                <CardTitle>{t("admin.published")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="published" checked={published} onCheckedChange={(v) => setPublished(!!v)} />
                  <Label htmlFor="published">{t("admin.published")}</Label>
                </div>
                <div>
                  <Label htmlFor="author">{t("admin.author")}</Label>
                  <Input id="author" value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("admin.category")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={categoryId || "none"} onValueChange={(v) => setCategoryId(v === "none" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без категории</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{localized(cat, "name") || cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("admin.tags")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer select-none"
                      onClick={() => toggleTag(tag.id)}
                    >
                      {localized(tag, "name") || tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {isEdit ? t("admin.save") : t("admin.create_article")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
