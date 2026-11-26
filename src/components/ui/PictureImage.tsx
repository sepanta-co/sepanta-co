import { IMAGE_MANIFEST } from "@/data/image-manifest";
import type { ImageKey } from "@/data/types";

export interface PictureImageProps {
  imageKey: ImageKey;
  alt: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  className?: string;
  pictureClassName?: string;
}

export function PictureImage({
  imageKey,
  alt,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  fill = false,
  className = "",
  pictureClassName = "",
}: PictureImageProps) {
  const entry = IMAGE_MANIFEST[imageKey];

  return (
    <picture
      className={
        fill
          ? `block h-full w-full ${pictureClassName}`.trim()
          : `block ${pictureClassName}`.trim()
      }
    >
      <source type="image/avif" srcSet={entry.avifSrcSet} sizes={sizes} />
      <source type="image/webp" srcSet={entry.webpSrcSet} sizes={sizes} />
      <img
        src={entry.src}
        width={entry.width}
        height={entry.height}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding={priority ? "sync" : "async"}
        className={
          fill
            ? `absolute inset-0 h-full w-full object-cover ${className}`.trim()
            : `block h-auto w-full ${className}`.trim()
        }
      />
    </picture>
  );
}
