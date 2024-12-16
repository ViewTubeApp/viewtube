"use client";

import { type Variants, motion } from "motion/react";

import { type CategoryItems } from "@/lib/router";

import { Button } from "./ui/button";

interface CategoriesSectionProps {
  items: CategoryItems;
  variants: Variants;
}

export function CategoriesSection({ items, variants }: CategoriesSectionProps) {
  return (
    <motion.div className="px-3 py-2">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-2 px-4 text-lg font-semibold tracking-tight">
        Categories
      </motion.h2>
      <motion.div className="space-y-1">
        {items.map((item, index) => (
          <motion.div key={item.label} variants={variants} custom={index} initial="closed" animate="open" whileHover={{ scale: 1.02 }}>
            <Button variant="ghost" className="w-full justify-start">
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
