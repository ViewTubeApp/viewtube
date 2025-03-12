import { Clock, Flame, Hash, Heart, Home, LayoutList, Video } from "lucide-react";
import { useTranslations } from "next-intl";

export function useNavigationItems() {
  const t = useTranslations();

  return {
    public: [
      {
        title: t("home"),
        url: "/",
        icon: Home,
      },
      {
        title: t("videos"),
        url: "/videos",
        icon: Video,
      },
      {
        title: t("popular"),
        url: { pathname: "/videos", query: { s: "popular" } },
        icon: Flame,
      },
      {
        title: t("new"),
        url: { pathname: "/videos", query: { s: "new" } },
        icon: Clock,
      },
      {
        title: t("models"),
        url: "/models",
        icon: Heart,
      },
      {
        title: t("categories"),
        url: "/categories",
        icon: LayoutList,
      },
    ],

    admin: [
      {
        title: t("videos"),
        url: "/admin/videos",
        icon: Video,
      },
      {
        title: t("categories"),
        url: "/admin/categories",
        icon: LayoutList,
      },
      {
        title: t("tags"),
        url: "/admin/tags",
        icon: Hash,
      },
      {
        title: t("models"),
        url: "/admin/models",
        icon: Heart,
      },
    ],
  };
}
