import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import Index from "./pages/Index";
import PostPage from "./pages/PostPage";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import TagPage from "./pages/TagPage";
import NotFound from "./pages/NotFound";

const App = () => (
  <I18nProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/post/:slug" element={<PostPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/tag/:slug" element={<TagPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </I18nProvider>
);

export default App;
