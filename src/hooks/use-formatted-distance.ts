import { type Locale } from "@/i18n/routing";
import { formatDistance } from "date-fns/formatDistance";
import { enUS, ru } from "date-fns/locale";
import { useLocale } from "next-intl";
import { match } from "ts-pattern";

export function useFormattedDistance() {
  const locale = useLocale() as Locale;

  return (timestamp: Date) =>
    formatDistance(timestamp, new Date(), {
      addSuffix: true,
      locale: match(locale)
        .with("ru", () => ru)
        .with("en", () => enUS)
        .exhaustive(),
    });
}
