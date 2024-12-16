import { Clock, Compass, Film, Flame, Gamepad2, Home, Music2, Newspaper, ThumbsUp } from "lucide-react";

import { type CategoryItems, type NavigationItems } from "@/lib/router";

export const MENU_ITEMS: NavigationItems = [
  { icon: Home, label: "Home", variant: "secondary" },
  { icon: Compass, label: "Explore", variant: "ghost" },
  { icon: Clock, label: "History", variant: "ghost" },
  { icon: ThumbsUp, label: "Liked Videos", variant: "ghost" },
] as const;

export const CATEGORIES: CategoryItems = [
  { icon: Film, label: "Movies" },
  { icon: Gamepad2, label: "Gaming" },
  { icon: Newspaper, label: "News" },
  { icon: Music2, label: "Music" },
  { icon: Flame, label: "Trending" },
] as const;
