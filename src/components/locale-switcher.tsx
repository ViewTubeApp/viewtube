"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { LanguagesIcon } from "lucide-react";
import { type Locale, useLocale, useTranslations } from "next-intl";
import { type ComponentProps, type FC } from "react";

import { cn } from "@/lib/utils";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export const LocaleSwitcher: FC<ComponentProps<typeof SelectTrigger>> = (props) => {
  const t = useTranslations();

  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <Select value={locale} onValueChange={(value: Locale) => router.replace(pathname, { locale: value })}>
      <SelectTrigger {...props} className={cn("h-8 w-32", props.className)}>
        <LanguagesIcon className="h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent side="top">
        {routing.locales.map((cur) => (
          <SelectItem key={cur} value={cur}>
            {t(`locale_${cur}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
