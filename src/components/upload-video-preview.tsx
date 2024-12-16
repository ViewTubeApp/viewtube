import { cn } from "@/lib/clsx";
import { XIcon } from "lucide-react";
import { memo, type FC } from "react";
import { VideoPlayer } from "./video-player";

interface UploadVideoPreviewProps {
  title: string;
  src: File | Blob;
  className?: string;
  onRemove?: () => void;
}

export const UploadVideoPreview: FC<UploadVideoPreviewProps> = memo(({ title, src, className, onRemove }) => {
  return (
    <div className={cn("relative", className)}>
      <VideoPlayer title={title} src={src} />
      <XIcon
        size={20}
        onClick={onRemove}
        className="absolute right-2 top-2 cursor-pointer rounded-full bg-neutral-800 p-1 text-neutral-200 transition-colors hover:bg-neutral-700"
      />
    </div>
  );
});

UploadVideoPreview.displayName = "UploadVideoPreview";