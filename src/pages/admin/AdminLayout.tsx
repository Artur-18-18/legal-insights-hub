import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Tags,
  LogOut,
  Menu,
  Scale,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { LangToggle } from "@/components/LangToggle";

const useAdminNav = () => {
  const { t } = useI18n();
  return [
    { icon: LayoutDashboard, label: t("admin.dashboard"), path: "/admin" },
    { icon: FileText, label: t("admin.posts"), path: "/admin/posts" },
    { icon: FolderOpen, label: t("admin.categories"), path: "/admin/categories" },
    { icon: Tags, label: t("admin.tags"), path: "/admin/tags" },
  ];
};

function SidebarContent({
  onItemClick,
  onLogout,
}: {
  onItemClick?: () => void;
  onLogout: () => void;
}) {
  const location = useLocation();
  const { t } = useI18n();
  const navItems = useAdminNav();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center gap-2">
        <Scale className="h-6 w-6 text-gold" />
        <span className="font-semibold text-lg tracking-tight">{t("site.name")}</span>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Eye className="h-4 w-4 shrink-0" />
          {t("admin.view_site")}
        </a>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {t("admin.signout")}
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { t } = useI18n();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-muted/30 flex font-sans antialiased text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-card border-r flex-col shrink-0">
        <SidebarContent onLogout={handleLogout} />
      </aside>

      {/* Mobile sidebar via Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="p-0 w-72 max-w-[80vw]">
          <SidebarContent
            onItemClick={() => setSheetOpen(false)}
            onLogout={() => {
              setSheetOpen(false);
              handleLogout();
            }}
          />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b h-14 flex items-center justify-between px-3 sm:px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label={t("admin.menu")}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            <Scale className="h-5 w-5 text-gold lg:hidden" />
            <span className="font-semibold text-sm sm:text-base tracking-tight lg:hidden">
              {t("site.name")}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <LangToggle />
            <div className="hidden sm:flex text-sm items-center gap-1">
              <span className="text-muted-foreground">{t("admin.user")}:</span>{" "}
              <span className="font-medium text-foreground antialiased">
                {user?.name?.trim() || t("admin.user_display_fallback")}
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
