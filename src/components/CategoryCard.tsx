import { Link } from "react-router-dom";
import { Building2, Users, Scale, Calculator, HardHat, LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Building2,
  Users,
  Scale,
  Calculator,
  HardHat,
};

interface CategoryCardProps {
  category: {
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
  };
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = category.icon ? iconMap[category.icon] || Scale : Scale;

  return (
    <Link
      to={`/category/${category.slug}`}
      className="group flex flex-col items-center p-6 rounded-lg bg-card border border-border/50 hover:border-gold/50 hover:shadow-md transition-all duration-300 text-center"
    >
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-gold/10 transition-colors">
        <Icon className="h-6 w-6 text-primary group-hover:text-gold transition-colors" />
      </div>
      <h3 className="font-serif font-semibold text-sm mb-1">{category.name}</h3>
      {category.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{category.description}</p>
      )}
    </Link>
  );
}
