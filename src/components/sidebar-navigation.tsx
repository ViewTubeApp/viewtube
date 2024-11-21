"use client";

import { type NavigationItems } from "@/lib/navigation";
import { motion, type Variants } from "motion/react";
import { Button } from "./ui/button";

interface NavigationSectionProps {
  items: NavigationItems;
  variants: Variants;
}

export function NavigationSection({ items, variants }: NavigationSectionProps) {
  return (
    <motion.div className="px-3 py-2">
      <motion.div className="space-y-1">
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            variants={variants}
            custom={index}
            initial="closed"
            animate="open"
            whileHover={{ scale: 1.02 }}
          >
            <Button variant={item.variant} className="w-full justify-start">
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
