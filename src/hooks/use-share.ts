import { logger } from "@/utils/react/logger";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

/**
 * Hook for working with copy and share functions.
 * @returns Object with copy and share functions.
 */
export function useShare() {
  const log = logger.withTag("useShare");
  const t = useTranslations();

  /**
   * Copies text to clipboard.
   * @param text Text to copy
   */
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("copy_success", { text }));
    } catch (error) {
      log.error("error copying to clipboard:", error);
      toast.error(t("error_copy"));
    }
  };

  /**
   * Shares URL via Web Share API or copies to clipboard if API is not supported.
   * @param url URL to share
   * @param title Title for sharing
   * @param description Description for sharing
   */
  const share = async (url: string, title: string, description: string | null) => {
    if (navigator.share) {
      try {
        await navigator.share({
          url,
          title,
          text: description ?? undefined,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        log.error("error sharing:", error);
        toast.error(t("error_share"));
        copy(url);
      }
    } else {
      log.error("Web Share API not supported");
      toast.error(t("error_share"));
      copy(url);
    }
  };

  return { copy, share };
}
