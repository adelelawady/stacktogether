import { cn } from "@/lib/utils";
import { ComponentProps, forwardRef } from "react";

export interface BreadcrumbProps extends ComponentProps<"nav"> {
  separator?: string;
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ children, className, separator = "/", ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="breadcrumb"
        className={cn("relative", className)}
        {...props}
      >
        <ol className="flex items-center space-x-2">{children}</ol>
      </nav>
    );
  }
);
Breadcrumb.displayName = "Breadcrumb";

export interface BreadcrumbItemProps extends ComponentProps<"li"> {
  isCurrentPage?: boolean;
}

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ children, className, isCurrentPage, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn(
          "inline-flex items-center space-x-2",
          isCurrentPage ? "text-gray-600" : "text-gray-500",
          className
        )}
        aria-current={isCurrentPage ? "page" : undefined}
        {...props}
      >
        {children}
      </li>
    );
  }
);
BreadcrumbItem.displayName = "BreadcrumbItem";

export interface BreadcrumbLinkProps extends ComponentProps<"a"> {
  as?: any;
}

export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ as: Component = "a", className, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          "hover:text-gray-900 hover:underline transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);
BreadcrumbLink.displayName = "BreadcrumbLink";
