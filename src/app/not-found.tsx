import { env } from "@/env";
import { routing } from "@/i18n/routing";

import { BaseLayout } from "@/components/base-layout";
import { NotFoundPage } from "@/components/not-found-page";

const brand = env.NEXT_PUBLIC_BRAND.toUpperCase();

export default function NotFound() {
  return (
    <BaseLayout brand={brand} locale={routing.defaultLocale}>
      <NotFoundPage />
    </BaseLayout>
  );
}
