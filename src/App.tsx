import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import PostPage from "./pages/PostPage";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import TagPage from "./pages/TagPage";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import PostsList from "./pages/admin/PostsList";
import PostForm from "./pages/admin/PostForm";
import CategoriesList from "./pages/admin/CategoriesList";
import TagsList from "./pages/admin/TagsList";
import ImagesPage from "./pages/admin/ImagesPage";

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("admin_token");
  if (!token) {
    window.location.href = "/admin/login";
    return null;
  }
  return <>{children}</>;
}

const App = () => (
  <HelmetProvider>
    <BrowserRouter>
      <I18nProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/post/:slug" element={<PostPage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/tag/:slug" element={<TagPage />} />

              {/* Admin auth */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin protected routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="posts" element={<PostsList />} />
                <Route path="posts/new" element={<PostForm />} />
                <Route path="posts/edit/:id" element={<PostForm />} />
                <Route path="categories" element={<CategoriesList />} />
                <Route path="tags" element={<TagsList />} />
                <Route path="images" element={<ImagesPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </TooltipProvider>
      </I18nProvider>
    </BrowserRouter>
  </HelmetProvider>
);

export default App;
