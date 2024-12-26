import { format } from "date-fns/format";
import { motion } from "motion/react";
import { type FC } from "react";

import { type Category } from "@/server/db/schema";

import { Card } from "@/components/ui/card";

import { CategoryRowActions } from "./actions";

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: FC<CategoryCardProps> = ({ category }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: "easeOut" }}>
      <Card className="transition-colors hover:bg-muted/50 isolate relative p-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h3 className="font-medium">{category.name}</h3>
            <p className="text-sm text-muted-foreground">Created {format(category.createdAt, "dd/MM/yyyy HH:mm")}</p>
          </div>
          <CategoryRowActions category={category} />
        </div>
      </Card>
    </motion.div>
  );
};
