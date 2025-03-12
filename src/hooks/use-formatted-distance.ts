import { type Locale } from "@/i18n/routing";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { enUS, ru } from "date-fns/locale";
import { useLocale } from "next-intl";
import { match } from "ts-pattern";

export function useFormattedDistance() {
  const locale = useLocale() as Locale;

  return (timestamp: Date) =>
    formatDistanceToNow(timestamp, {
      addSuffix: true,
      locale: match(locale)
        .with("ru", () => ru)
        .with("en", () => enUS)
        .exhaustive(),
    });
}
