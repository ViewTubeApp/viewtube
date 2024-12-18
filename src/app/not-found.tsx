"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <DotLottieReact
        src="/lottie/404.lottie"
        autoplay
        loop
        className="size-full grid place-items-center"
        renderConfig={{ autoResize: true }}
      />
    </div>
  );
}
