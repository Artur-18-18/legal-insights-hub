import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, ExternalLink, ArrowLeft, Download } from "lucide-react";
import { format } from "date-fns";
import { useI18n, useLocalized, getDateFnsLocale } from "@/lib/i18n";
import { api } from "@/lib/api";
import { getPostBySlug } from "@/lib/mock-data";
import html2pdf from "html2pdf.js";

interface PostTag {
  tags: { name: string; name_uz?: string; name_en?: string; slug: string } | null;
}

interface Post {
  _id?: string;
  id?: string;
  title: string;
  title_uz?: string;
  title_en?: string;
  slug: string;
  excerpt: string | null;
  excerpt_uz?: string;
  excerpt_en?: string;
  content: string;
  content_uz?: string;
  content_en?: string;
  featured_image: string | null;
  created_at: string;
  author_name: string;
  published: boolean;
  legislation_links: Array<{ title: string; url: string }>;
  categories: {
    name: string;
    name_uz?: string;
    name_en?: string;
    slug: string;
    icon: string | null;
  } | null;
  post_tags: PostTag[];
  post_images: Array<{ url: string; alt_text: string | null }>;
  post_videos?: Array<{ url: string; alt_text: string | null }>;
}

const PostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useI18n();
  const localized = useLocalized();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getPost(slug)
      .then((data) => {
        const cat = data.category as {
          name: string;
          name_uz?: string;
          name_en?: string;
          slug: string;
          icon?: string | null;
        } | null;
        setPost({
          ...data,
          categories: cat
            ? {
                name: cat.name,
                name_uz: cat.name_uz,
                name_en: cat.name_en,
                slug: cat.slug,
                icon: cat.icon ?? null,
              }
            : null,
          post_tags: data.tags
            ? data.tags.map((tag: { name: string; name_uz?: string; name_en?: string; slug: string }) => ({
                tags: { name: tag.name, name_uz: tag.name_uz, name_en: tag.name_en, slug: tag.slug },
              }))
            : [],
        });
      })
      .catch(() => {
        const mockPost = getPostBySlug(slug);
        if (mockPost) setPost(mockPost as unknown as Post);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const downloadPdf = useCallback(async () => {
    if (!articleRef.current || !post) return;
    setDownloading(true);

    const element = articleRef.current;

    // Скрываем кнопки перед генерацией PDF
    const printControls = element.querySelectorAll(".print-hidden");
    printControls.forEach((el) => {
      (el as HTMLElement).style.display = "none";
    });

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${post.slug}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      // Восстанавливаем видимость кнопок
      printControls.forEach((el) => {
        (el as HTMLElement).style.display = "";
      });
      setDownloading(false);
    }
  }, [post]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse space-y-4 max-w-3xl">
            <div className="h-6 bg-muted rounded w-32" />
            <div className="h-10 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-40 bg-muted rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <Helmet>
          <title>{t("posts.notfound")} — {t("site.name")}</title>
          <meta name="description" content={t("posts.notfound")} />
        </Helmet>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground text-lg">{t("posts.notfound")}</p>
          <Link to="/" className="text-gold mt-4 inline-block">{t("posts.tohome")}</Link>
        </div>
      </Layout>
    );
  }

  const title = localized(post, "title") || post.title;
  const excerpt = localized(post, "excerpt") || post.excerpt;
  const content = localized(post, "content") || post.content;
  const dateLocale = getDateFnsLocale(lang);
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const postUrl = `${siteUrl}/post/${post.slug}`;
  const imageUrl = post.featured_image || `${siteUrl}/og-image.jpg`;
  const seoDescription = excerpt || content.replace(/<[^>]*>/g, "").substring(0, 160);

  const hasMedia = post.post_images.length > 0 || (post.post_videos && post.post_videos.length > 0);
  const totalImages = post.post_images.length;
  const collageImages = post.post_images.slice(0, 5);
  const remainingImagesCount = Math.max(totalImages - collageImages.length, 0);
  const getImageCollageClass = (index: number) => {
    if (collageImages.length === 1) {
      return "col-span-2 aspect-[16/10]";
    }

    if (collageImages.length === 2) {
      return "aspect-[4/3]";
    }

    if (collageImages.length >= 3 && index === 0) {
      return "col-span-2 aspect-[16/10]";
    }

    return "aspect-square";
  };

  return (
    <Layout>
      <Helmet>
        <title>{title} — {t("site.name")}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={postUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta property="article:published_time" content={post.created_at} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={seoDescription} />
        <link rel="canonical" href={postUrl} />
      </Helmet>
      <article ref={articleRef} className="container mx-auto px-4 py-6 md:py-10 max-w-5xl print:max-w-none">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 md:mb-6 print:hidden print-hidden">
          <ArrowLeft className="h-4 w-4" /> {t("posts.back")}
        </Link>

        <header className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {post.categories && (
              <Link to={`/category/${post.categories.slug}`}>
                <Badge variant="secondary">{localized(post.categories, "name") || post.categories.name}</Badge>
              </Link>
            )}
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(post.created_at), "d MMMM yyyy", { locale: dateLocale })}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">{title}</h1>
          {excerpt && <p className="text-base md:text-lg text-muted-foreground">{excerpt}</p>}
          <div className="flex flex-wrap items-center gap-2 mt-4 print-hidden">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <FileText className="h-4 w-4 mr-1" /> {t("posts.print")}
            </Button>
            <Button variant="outline" size="sm" onClick={downloadPdf} disabled={downloading}>
              {downloading ? (
                <span className="animate-spin h-4 w-4 mr-1">⏳</span>
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              {t("posts.download_pdf")}
            </Button>
          </div>
        </header>

        {post.featured_image && (
          <img src={post.featured_image} alt={title} className="w-full rounded-lg mb-6 md:mb-8 shadow-sm" />
        )}

        {/* Layout: content + media side by side when media exists */}
        <div className={hasMedia ? "flex flex-col lg:flex-row gap-6 md:gap-8" : ""}>
          <div className={hasMedia ? "flex-1 min-w-0" : ""}>
            <div
              className="prose prose-slate max-w-none mb-6 md:mb-8 prose-sm md:prose-base prose-headings:font-serif prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-gold prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>

          {/* Media sidebar — only shown when media exists */}
          {hasMedia && (
            <div className="lg:w-80 xl:w-96 flex-shrink-0 space-y-4">
              {post.post_images.length > 0 && (
                <div>
                  <h3 className="font-serif text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                    {t("admin.images")}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {collageImages.map((img, i) => {
                      const isLastVisible = i === collageImages.length - 1;
                      const showRemainingBadge = isLastVisible && remainingImagesCount > 0;

                      return (
                        <div
                          key={i}
                          className={`relative overflow-hidden rounded-lg ${getImageCollageClass(i)}`}
                        >
                          <img
                            src={img.url}
                            alt={img.alt_text || post.title}
                            className="w-full h-full shadow-sm hover:shadow-md transition-transform duration-300 hover:scale-[1.02] object-cover"
                            loading="lazy"
                          />
                          {showRemainingBadge && (
                            <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                              <span className="text-white text-lg font-semibold">+{remainingImagesCount}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {post.post_videos && post.post_videos.length > 0 && (
                <div className="print:hidden print-hidden">
                  <h3 className="font-serif text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                    {t("posts.videos")}
                  </h3>
                  <div className="space-y-3">
                    {post.post_videos.map((vid, i) => (
                      <video
                        key={i}
                        src={vid.url}
                        controls
                        className="w-full rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        preload="metadata"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {post.legislation_links.length > 0 && (
          <div className="bg-muted rounded-lg p-4 md:p-5 mb-6 md:mb-8">
            <h3 className="font-serif text-base md:text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gold" /> {t("posts.legislation")}
            </h3>
            <ul className="space-y-2">
              {post.legislation_links.map((link, i) => (
                <li key={i}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gold hover:underline inline-flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" /> {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {post.post_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 print:hidden print-hidden">
            {post.post_tags.map((pt) =>
              pt.tags ? (
                <Link key={pt.tags.slug} to={`/tag/${pt.tags.slug}`}>
                  <Badge variant="outline">#{localized(pt.tags, "name") || pt.tags.name}</Badge>
                </Link>
              ) : null
            )}
          </div>
        )}
      </article>
    </Layout>
  );
};

export default PostPage;
