import { BarChart, Clock, CloudUpload, Flame, Heart, Home, List } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

export function useNavigationItems() {
  const t = useTranslations("navigation");

  return useMemo(
    () => ({
      public: [
        {
          title: t("public.home"),
          url: "/",
          icon: Home,
        },
        {
          title: t("public.popular"),
          url: "/popular",
          icon: Flame,
        },
        {
          title: t("public.new"),
          url: "/new",
          icon: Clock,
        },
        {
          title: t("public.models"),
          url: "/models",
          icon: Heart,
        },
        {
          title: t("public.categories"),
          url: "/categories",
          icon: List,
        },
      ],

      admin: [
        {
          title: t("admin.upload"),
          url: "/admin/upload",
          icon: CloudUpload,
        },
        {
          title: t("admin.dashboard"),
          url: "/admin/dashboard",
          icon: BarChart,
        },
        {
          title: t("admin.categories"),
          url: "/admin/categories",
          icon: List,
        },
      ],
    }),
    [t],
  );
}
