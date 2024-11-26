import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface CategorySelectProps {
  categories: Category[];
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

export function CategorySelect({ 
  categories, 
  selectedCategories, 
  onChange 
}: CategorySelectProps) {
  const handleToggle = (categoryName: string) => {
    if (selectedCategories.includes(categoryName)) {
      onChange(selectedCategories.filter(c => c !== categoryName));
    } else {
      onChange([...selectedCategories, categoryName]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isSelected = selectedCategories.includes(category.name);
        return (
          <Badge
            key={category.id}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "cursor-pointer hover:bg-primary/20 transition-colors",
              isSelected && "bg-primary text-primary-foreground"
            )}
            onClick={() => handleToggle(category.name)}
          >
            {isSelected && <Check className="mr-1 h-3 w-3" />}
            {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
          </Badge>
        );
      })}
    </div>
  );
} 