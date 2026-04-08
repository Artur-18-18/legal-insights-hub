import { Link } from "react-router-dom";
import { Scale } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-gold" />
            <span className="font-serif font-bold text-foreground">
              Юрист<span className="text-gold">Блог</span>
            </span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/category/corporate-law" className="hover:text-foreground transition-colors">Корпоративное право</Link>
            <Link to="/category/taxes" className="hover:text-foreground transition-colors">Налоги</Link>
            <Link to="/category/construction" className="hover:text-foreground transition-colors">Строительство</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ЮристБлог
          </p>
        </div>
      </div>
    </footer>
  );
}
