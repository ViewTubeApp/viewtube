import { getTranslations } from "next-intl/server";
import { type FC } from "react";

import { PageHeader } from "@/components/page-header";

export const TagsHeader: FC = async () => {
  const t = await getTranslations();
  return <PageHeader title={t("tags")} />;
};
