import { languageTag } from "@/paraglide/runtime";
import { formatDistance } from "date-fns/formatDistance";
import { enUS, ru } from "date-fns/locale";
import { match } from "ts-pattern";

export function useFormattedDistance() {
  return (timestamp: Date) =>
    formatDistance(timestamp, new Date(), {
      addSuffix: true,
      locale: match(languageTag())
        .with("ru", () => ru)
        .with("en", () => enUS)
        .exhaustive(),
    });
}
