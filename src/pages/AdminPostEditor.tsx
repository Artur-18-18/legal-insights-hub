import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Plus, X, Upload, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LegislationLink {
  title: string;
  url: string;
}

const AdminPostEditor = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authorName, setAuthorName] = useState("Автор");
  const [published, setPublished] = useState(false);
  const [featuredImage, setFeaturedImage] = useState("");
  const [legislationLinks, setLegislationLinks] = useState<LegislationLink[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return data || [];
    },
  });

  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data } = await supabase.from("tags").select("*").order("name");
      return data || [];
    },
  });

  const { data: existingPost } = useQuery({
    queryKey: ["admin-post", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, post_tags(tag_id)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !isNew && !!id,
  });

  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title);
      setSlug(existingPost.slug);
      setExcerpt(existingPost.excerpt || "");
      setContent(existingPost.content);
      setCategoryId(existingPost.category_id || "");
      setAuthorName(existingPost.author_name);
      setPublished(existingPost.published);
      setFeaturedImage(existingPost.featured_image || "");
      setLegislationLinks((existingPost.legislation_links as unknown as LegislationLink[]) || []);
      setSelectedTags(existingPost.post_tags?.map((pt: any) => pt.tag_id) || []);
    }
  }, [existingPost]);

  const generateSlug = (text: string) => {
    const translitMap: Record<string, string> = {
      а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
      з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
      п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
      ч: "ch", ш: "sh", щ: "shch", ы: "y", э: "e", ю: "yu", я: "ya",
      ъ: "", ь: "",
    };
    return text
      .toLowerCase()
      .split("")
      .map((c) => translitMap[c] || c)
      .join("")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isNew) setSlug(generateSlug(val));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const postData = {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        category_id: categoryId || null,
        author_name: authorName,
        published,
        featured_image: featuredImage || null,
        legislation_links: legislationLinks as unknown as any,
      };

      let postId: string;

      if (isNew) {
        const { data, error } = await supabase.from("posts").insert(postData).select("id").single();
        if (error) throw error;
        postId = data.id;
      } else {
        const { error } = await supabase.from("posts").update(postData).eq("id", id!);
        if (error) throw error;
        postId = id!;
      }

      // Update tags
      await supabase.from("post_tags").delete().eq("post_id", postId);
      if (selectedTags.length > 0) {
        const tagRows = selectedTags.map((tagId) => ({ post_id: postId, tag_id: tagId }));
        await supabase.from("post_tags").insert(tagRows);
      }

      return postId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast({ title: "Сохранено!" });
      navigate("/admin");
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Ошибка", description: err.message });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("post-images").upload(path, file);
    if (error) {
      toast({ variant: "destructive", title: "Ошибка загрузки", description: error.message });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(path);
    setFeaturedImage(urlData.publicUrl);
    setUploading(false);
  };

  if (!isAdmin) {
    navigate("/admin/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {t("posts.back")}
          </Link>
          <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !title || !slug}>
            <Save className="h-4 w-4 mr-1" /> {t("admin.save")}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <h1 className="font-serif text-xl md:text-2xl font-bold mb-6">
          {isNew ? t("admin.newpost") : t("admin.editpost")}
        </h1>

        <div className="space-y-6">
          {/* Title & Slug */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label>{t("admin.title")}</Label>
                <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} />
              </div>
              <div>
                <Label>{t("admin.slug")}</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>
              <div>
                <Label>{t("admin.excerpt")}</Label>
                <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} />
              </div>
              <div>
                <Label>{t("admin.author")}</Label>
                <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Category & Tags & Published */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label>{t("admin.category")}</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("admin.tags")}</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {tags?.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() =>
                        setSelectedTags((prev) =>
                          prev.includes(tag.id)
                            ? prev.filter((t) => t !== tag.id)
                            : [...prev, tag.id]
                        )
                      }
                    >
                      #{tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={published} onCheckedChange={setPublished} />
                <Label>{t("admin.published")}</Label>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("admin.images")}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {featuredImage && (
                <div className="relative">
                  <img src={featuredImage} alt="" className="rounded-lg max-h-48 object-cover w-full" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => setFeaturedImage("")}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div>
                <Label htmlFor="img-upload" className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-muted rounded-md text-sm hover:bg-accent transition-colors">
                  <Upload className="h-4 w-4" /> {uploading ? "..." : t("admin.upload")}
                </Label>
                <input id="img-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("admin.content")}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                className="font-mono text-sm"
                placeholder="<p>Текст статьи...</p>"
              />
            </CardContent>
          </Card>

          {/* Legislation Links */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("admin.legislation")}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {legislationLinks.map((link, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1">
                    <Input
                      placeholder={t("admin.linktitle")}
                      value={link.title}
                      onChange={(e) => {
                        const copy = [...legislationLinks];
                        copy[i] = { ...copy[i], title: e.target.value };
                        setLegislationLinks(copy);
                      }}
                    />
                    <Input
                      placeholder={t("admin.linkurl")}
                      value={link.url}
                      onChange={(e) => {
                        const copy = [...legislationLinks];
                        copy[i] = { ...copy[i], url: e.target.value };
                        setLegislationLinks(copy);
                      }}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive shrink-0 mt-1"
                    onClick={() => setLegislationLinks((prev) => prev.filter((_, j) => j !== i))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLegislationLinks((prev) => [...prev, { title: "", url: "" }])}
              >
                <Plus className="h-4 w-4 mr-1" /> {t("admin.addlink")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPostEditor;
