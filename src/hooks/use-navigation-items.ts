import * as m from "@/paraglide/messages";
import { BarChart, Clock, CloudUpload, Flame, Heart, Home, List } from "lucide-react";
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
          url: "/admin/dashboard",
          icon: BarChart,
        },
        {
          title: m.categories(),
          url: "/admin/categories",
          icon: List,
        },
      ],
    }),
    [],
  );
}
