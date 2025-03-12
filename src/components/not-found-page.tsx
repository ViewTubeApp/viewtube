import { Link } from "@/i18n/navigation";
import * as motion from "motion/react-client";
import { getTranslations } from "next-intl/server";
import { type FC } from "react";

import { motions } from "@/constants/motion";

import { Button } from "@/components/ui/button";

export const NotFoundPage: FC = async () => {
  const t = await getTranslations();

  return (
    <section className="flex dark h-full flex-col items-center justify-center">
      <div className="py-8 px-4 mx-auto max-w-(--breakpoint-xl) lg:py-16 lg:px-6">
        <div className="mx-auto max-w-(--breakpoint-sm) text-center">
          <motion.h1
            {...motions.scale.in}
            className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-500"
          >
            {t("not_found_title")}
          </motion.h1>
          <motion.p
            {...motions.slide.y.in}
            transition={{ delay: 0.2 }}
            className="mb-4 text-3xl tracking-tight font-bold md:text-4xl text-white"
          >
            {t("something_missing")}
          </motion.p>
          <motion.p {...motions.slide.y.in} transition={{ delay: 0 }} className="mb-4 text-lg font-light text-gray-400">
            {t("something_missing_description")}
          </motion.p>
          <motion.div {...motions.slide.y.in} transition={{ delay: 0.6 }}>
            <Link
              href="/"
              className="inline-flex text-white bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-hidden focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4"
            >
              <Button>{t("back_to_homepage")}</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
