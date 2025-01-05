import * as m from "@/paraglide/messages";
import { format } from "date-fns/format";
import { motion } from "motion/react";
import { type FC } from "react";

import { type CategoryResponse } from "@/server/api/routers/categories";

import { motions } from "@/constants/motion";

import { Card } from "@/components/ui/card";

import { CategoryRowActions } from "./actions";

interface CategoryCardProps {
  item: CategoryResponse;
}

export const CategoryCard: FC<CategoryCardProps> = ({ item: category }) => {
  return (
    <motion.div {...motions.slide.y.in}>
      <Card className="transition-colors hover:bg-muted/50 isolate relative p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h3 className="font-medium">{category.slug}</h3>
            <p className="text-sm text-muted-foreground">
              {m.created_at({ date: format(category.createdAt, "dd/MM/yyyy HH:mm") })}
            </p>
          </div>
          <CategoryRowActions category={category} />
        </div>
      </Card>
    </motion.div>
  );
};
