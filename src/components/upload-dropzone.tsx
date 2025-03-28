import { logger } from "@/utils/react/logger";
import { UploadDropzone as UTFSUploadDropzone } from "@/utils/react/uploadthing";
import { cn } from "@/utils/shared/clsx";
import invariant from "invariant";
import { useTranslations } from "next-intl";
import { type ComponentProps, type FC } from "react";
import { toast } from "sonner";

type PropsToOmit =
  | "config"
  | "uploadProgressGranularity"
  | "onBeforeUploadBegin"
  | "onClientUploadComplete"
  | "onUploadError";

type UploadDropzoneProps = Omit<ComponentProps<typeof UTFSUploadDropzone>, PropsToOmit> & {
  onChangeTitle?: (title: string) => void;
  onChangeFileKey?: (fileKey: string) => void;
};

const log = logger.withTag("form:upload");

export const UploadDropzone: FC<UploadDropzoneProps> = ({ className, onChangeTitle, onChangeFileKey, ...props }) => {
  const t = useTranslations();

  return (
    <UTFSUploadDropzone
      {...props}
      config={{ mode: "auto", cn }}
      className={cn(className, "border-1 border-dashed border-border rounded-lg")}
      uploadProgressGranularity="fine"
      onBeforeUploadBegin={(files) => {
        const [file] = files;
        invariant(file, "file is required");

        const { name } = file;
        const [title] = name.split(".");

        if (title) {
          onChangeTitle?.(title);
        }

        return files;
      }}
      onClientUploadComplete={(res) => {
        log.debug("upload completed", res);

        const [file] = res;

        if (!file) {
          toast.error(t("error_upload_failed"));
          return;
        }

        const { key } = file;
        onChangeFileKey?.(key);
      }}
      onUploadError={(error: Error) => {
        log.error("upload error", error);
        toast.error(error.message);
      }}
    />
  );
};
