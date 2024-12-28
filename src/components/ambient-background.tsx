"use client";

import { motion } from "motion/react";

import { motions } from "@/constants/motion";

import { NiceImage } from "@/components/nice-image";

interface AmbientBackgroundProps {
  src: string;
  alt: string;
}

export const AmbientBackground = ({ src, alt }: AmbientBackgroundProps) => {
  return (
    <div className="absolute inset-0 blur-3xl brightness-50 -z-10 overflow-hidden">
      <motion.div className="absolute inset-0" {...motions.scale.reveal}>
        <NiceImage
          priority
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
        />
      </motion.div>
    </div>
  );
};
