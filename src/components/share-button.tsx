import { useShare } from "@/hooks/use-share";
import { Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FC } from "react";

import { Button } from "./ui/button";

interface ShareButtonProps {
  url: string;
  title: string;
  description: string | null;
}

export const ShareButton: FC<ShareButtonProps> = ({ url, title, description }) => {
  const { share } = useShare();
  const t = useTranslations();

  const handleShare = () => {
    share(url, title, description);
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="col-span-1 flex-1 rounded-full sm:flex-initial"
      onClick={handleShare}
    >
      <Share2 className="size-4" />
      <span className="hidden lg:inline">{t("share")}</span>
    </Button>
  );
};
