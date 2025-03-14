import { loadImage } from "@/utils/react/image";
import * as motion from "motion/react-client";
import * as StackBlur from "stackblur-canvas";

import { motions } from "@/constants/motion";

interface AmbientBackgroundProps {
  src: string;
}

export const AmbientBackground = ({ src }: AmbientBackgroundProps) => {
  return (
    <div data-slot="AmbientBackground" className="absolute inset-0 brightness-50 -z-10 overflow-hidden">
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
