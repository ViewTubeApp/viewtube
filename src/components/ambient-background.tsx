import { loadImage } from "@/utils/react/image";
import * as motion from "motion/react-client";
import { useRef } from "react";
import * as StackBlur from "stackblur-canvas";

import { motions } from "@/constants/motion";

interface AmbientBackgroundProps {
  src: string;
}

export const AmbientBackground = ({ src }: AmbientBackgroundProps) => {
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={rootRef} className="absolute inset-0 brightness-50 -z-10 overflow-hidden">
      <motion.div className="absolute inset-0" {...motions.scale.reveal}>
        <canvas
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          ref={(el) => {
            if (!el) {
              return;
            }

            loadImage(src)
              .then((image) => {
                // Max value is 254 for this algorithm
                StackBlur.image(image, el, 254);
                el.style.width = "100%";
                el.style.height = "100%";
                el.width = rootRef.current?.clientWidth ?? 0;
                el.height = rootRef.current?.clientHeight ?? 0;
              })
              .catch((err) => {
                console.error(err);
              });
          }}
        />
      </motion.div>
    </div>
  );
};
