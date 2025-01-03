"use client";

import { motion } from "motion/react";
import { type FC } from "react";

import { Link } from "@/lib/i18n";

import { motions } from "@/constants/motion";

import { Button } from "@/components/ui/button";

export const NotFoundPage: FC = () => {
  return (
    <section className="flex dark h-full flex-col items-center justify-center">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          <motion.h1
            {...motions.scale.in}
            className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-500"
          >
            404
          </motion.h1>
          <motion.p
            {...motions.slide.y.in}
            transition={{ delay: 0.2 }}
            className="mb-4 text-3xl tracking-tight font-bold md:text-4xl text-white"
          >
            Something&apos;s missing.
          </motion.p>
          <motion.p {...motions.slide.y.in} transition={{ delay: 0 }} className="mb-4 text-lg font-light text-gray-400">
            Sorry, we can&apos;t find that page. You&apos;ll find lots to explore on the home page.
          </motion.p>
          <motion.div {...motions.slide.y.in} transition={{ delay: 0.6 }}>
            <Link
              href="/"
              className="inline-flex text-white bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4"
            >
              <Button>Back to Homepage</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
