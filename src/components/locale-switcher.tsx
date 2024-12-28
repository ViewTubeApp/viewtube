import { routing } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { type FC } from "react";

import { LocaleSwitcherSelect } from "./locale-switcher-select";
import { SelectItem } from "./ui/select";

export const LocaleSwitcher: FC = () => {
  const t = useTranslations("locale_switcher");
  const locale = useLocale();

  return (
    <LocaleSwitcherSelect defaultValue={locale} label={t("label")}>
      {routing.locales.map((cur) => (
        <SelectItem withCheckIcon={false} key={cur} value={cur}>
          {t("locale", { locale: cur })}
        </SelectItem>
      ))}
    </LocaleSwitcherSelect>
  );
};
