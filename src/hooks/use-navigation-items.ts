import * as m from "@/paraglide/messages";
import { Clock, CloudUpload, Flame, Heart, Home, List, ListVideoIcon, Tag } from "lucide-react";
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
          title: m.popular(),
          url: "/popular",
          icon: Flame,
        },
        {
          title: m.new_str(),
          url: "/new",
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
          icon: List,
        },
      ],

      admin: [
        {
          title: m.upload(),
          url: "/admin/upload",
          icon: CloudUpload,
        },
        {
          title: m.dashboard(),
          url: "/admin/videos",
          icon: ListVideoIcon,
        },
        {
          title: m.categories(),
          url: "/admin/categories",
          icon: List,
        },
        {
          title: m.tags(),
          url: "/admin/tags",
          icon: Tag,
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
