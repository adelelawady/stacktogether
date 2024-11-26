import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-8",
  md: "h-12",
  lg: "h-16",
};

export function Logo({ className, size = "md" }: LogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <svg
        className={cn(sizes[size], "w-auto")}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="100" height="100" rx="20" fill="hsl(var(--primary))" />
        <path
          d="M30 70V30L50 50L70 30V70"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={cn(
        "ml-2 font-bold tracking-tight",
        size === "sm" && "text-xl",
        size === "md" && "text-2xl",
        size === "lg" && "text-3xl",
      )}>
        StackConnect
      </span>
    </div>
  );
} 