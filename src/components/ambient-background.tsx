import { loadImage } from "@/utils/react/image";
import * as motion from "motion/react-client";
import { useRef } from "react";
import * as StackBlur from "stackblur-canvas";
import { P, match } from "ts-pattern";

import { motions } from "@/constants/motion";

interface AmbientBackgroundProps {
  src: string;
}

export const AmbientBackground = ({ src }: AmbientBackgroundProps) => {
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={rootRef} className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div className="absolute inset-0" {...motions.scale.reveal}>
        <canvas
          className="absolute brightness-50 grayscale-25 opacity-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          ref={(el) => {
            if (!el) {
              return;
            }

            loadImage(src)
              .then((image) => {
                // Max value is 254 for this algorithm
                StackBlur.image(image, el, 254);
                const aspectRatio = image.width / image.height;

                // Determine the aspect mode of the image
                const aspectMode = match(aspectRatio)
                  .with(P.number.gt(1), () => "landscape")
                  .with(P.number.lt(1), () => "portrait")
                  .otherwise(() => "square");

                // Set the aspect mode of the canvas
                match(aspectMode)
                  .with("landscape", () => {
                    el.style.height = "100%";
                  })
                  .with("portrait", () => {
                    el.style.width = "100%";
                  })
                  .otherwise(() => {
                    el.style.width = "100%";
                    el.style.height = "100%";
                  });
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
