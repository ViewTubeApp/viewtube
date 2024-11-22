"use client";

import { motion } from "motion/react";
import { type PropsWithChildren } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function LayoutContent({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <motion.main className="flex-1 p-4">{children}</motion.main>
      </div>
    </div>
  );
}
