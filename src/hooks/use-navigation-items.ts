import * as m from "@/paraglide/messages";
import { Clock, Flame, Hash, Heart, Home, LayoutList, Video } from "lucide-react";
import { useMemo } from "react";

export function useNavigationItems() {
  return useMemo(
    () => ({
      public: [
        {
          title: m.home(),
          url: "/",
          icon: Home,
        },
        {
          title: m.videos(),
          url: "/videos",
          icon: Video,
        },
        {
          title: m.popular(),
          url: { pathname: "/videos", query: { s: "popular" } },
          icon: Flame,
        },
        {
          title: m.new_str(),
          url: { pathname: "/videos", query: { s: "new" } },
          icon: Clock,
        },
        {
          title: m.models(),
          url: "/models",
          icon: Heart,
        },
        {
          title: m.categories(),
          url: "/categories",
          icon: LayoutList,
        },
      ],

      admin: [
        {
          title: m.videos(),
          url: "/admin/videos",
          icon: Video,
        },
        {
          title: m.categories(),
          url: "/admin/categories",
          icon: LayoutList,
        },
        {
          title: m.tags(),
          url: "/admin/tags",
          icon: Hash,
        },
        {
          title: m.models(),
          url: "/admin/models",
          icon: Heart,
        },
      ],
    }),
    [],
  );
}
