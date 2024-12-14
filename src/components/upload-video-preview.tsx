import { cn } from "@/lib/clsx";
import { XIcon } from "lucide-react";
import { memo, type FC } from "react";

interface UploadVideoPreviewProps {
  src: string;
  className?: string;
  onRemove?: () => void;
}

export const UploadVideoPreview: FC<UploadVideoPreviewProps> = memo(({ src, className, onRemove }) => {
  return (
    <div className={cn("relative", className)}>
      <video controls src={src} className="rounded-xl" />
      <XIcon
        onClick={onRemove}
        className="absolute right-2 top-2 cursor-pointer rounded-full bg-neutral-800 p-1 text-neutral-400 transition-colors hover:text-neutral-200"
      />
    </div>
  );
});

UploadVideoPreview.displayName = "UploadVideoPreview";
