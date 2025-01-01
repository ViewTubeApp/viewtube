"use client";

import * as m from "@/paraglide/messages";
import { type AvailableLanguageTag, availableLanguageTags, languageTag } from "@/paraglide/runtime";
import { LanguagesIcon } from "lucide-react";
import { type FC } from "react";

import { usePathname, useRouter } from "@/lib/i18n";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export const LocaleSwitcher: FC = () => {
  const router = useRouter();
  const locale = languageTag();
  const pathname = usePathname();

  return (
    <Select value={locale} onValueChange={(value: AvailableLanguageTag) => router.replace(pathname, { locale: value })}>
      <SelectTrigger className="h-8 w-32">
        <LanguagesIcon className="h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent side="top">
        {availableLanguageTags.map((cur) => (
          <SelectItem key={cur} value={cur}>
            {m[`locale_${cur}`]()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
