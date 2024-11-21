import { type LucideIcon } from "lucide-react";

export interface NavigationItem {
  icon: LucideIcon;
  label: string;
  variant: "ghost" | "secondary";
}

export interface CategoryItem {
  icon: LucideIcon;
  label: string;
}

export type NavigationItems = readonly NavigationItem[];
export type CategoryItems = readonly CategoryItem[];
