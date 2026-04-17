import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { FileText, FileText as FileDraft, FolderOpen, Tags, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

interface Stats {
  posts: number;
  drafts: number;
  categories: number;
  tags: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ posts: 0, drafts: 0, categories: 0, tags: 0 });
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    api.getStats()
      .then(setStats)
      .catch(() => setStats({ posts: 0, drafts: 0, categories: 0, tags: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { title: t("admin.published_badge"), value: stats.posts, icon: FileText, color: "text-green-500", link: "/admin/posts" },
    { title: t("admin.draft_badge"), value: stats.drafts, icon: FileDraft, color: "text-yellow-500", link: "/admin/posts" },
    { title: t("admin.categories"), value: stats.categories, icon: FolderOpen, color: "text-blue-500", link: "/admin/categories" },
    { title: t("admin.tags"), value: stats.tags, icon: Tags, color: "text-purple-500", link: "/admin/tags" },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{t("admin.dashboard")}</h1>
        <Link
          to="/admin/posts/new"
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto"
        >
          <TrendingUp className="h-4 w-4" /> {t("admin.new_article")}
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-20 mb-2" />
                  <div className="h-8 bg-muted rounded w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-1">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl sm:text-3xl font-bold">{stat.value}</span>
                    <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color}`} />
                  </div>
                  <Link to={stat.link} className="text-xs text-muted-foreground hover:text-foreground mt-2 block">
                    {t("posts.read")} →
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="mt-4 md:mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">{t("admin.quick_actions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link to="/admin/posts/new" className="block p-4 border rounded-md hover:bg-muted transition-colors">
              <FileText className="h-5 w-5 text-primary mb-2" />
              <p className="font-medium text-sm">{t("admin.create_article")}</p>
              <p className="text-xs text-muted-foreground">{t("admin.create_post_desc")}</p>
            </Link>
            <Link to="/admin/categories" className="block p-4 border rounded-md hover:bg-muted transition-colors">
              <FolderOpen className="h-5 w-5 text-blue-500 mb-2" />
              <p className="font-medium text-sm">{t("admin.manage_categories")}</p>
              <p className="text-xs text-muted-foreground">{t("admin.manage_categories_desc")}</p>
            </Link>
            <Link to="/admin/tags" className="block p-4 border rounded-md hover:bg-muted transition-colors">
              <Tags className="h-5 w-5 text-purple-500 mb-2" />
              <p className="font-medium text-sm">{t("admin.manage_tags")}</p>
              <p className="text-xs text-muted-foreground">{t("admin.manage_tags_desc")}</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
