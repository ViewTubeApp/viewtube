import * as motion from "motion/react-client";
import { type FC, type ReactNode } from "react";

import { motions } from "@/constants/motion";

import { Separator } from "@/components/ui/separator";

interface PageHeaderProps {
  title: ReactNode;
  extra?: ReactNode;
}

export const PageHeader: FC<PageHeaderProps> = ({ title, extra }) => {
  return (
    <motion.div {...motions.fade.in} className="mb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
        {extra}
      </div>
      <Separator className="mt-4 relative -left-2 w-[calc(100%+1rem)] sm:-left-4 sm:w-[calc(100%+2rem)]" />
    </motion.div>
  );
};
