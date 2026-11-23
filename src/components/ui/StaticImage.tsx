import React from "react";
import { assetPath } from "@/lib/assets";
import { cn } from "@/lib/utils";

export interface StaticImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
}

export function StaticImage({
  src,
  alt,
  fill = false,
  priority = false,
  className,
  ...rest
}: StaticImageProps) {
  return (
    <img
      src={assetPath(src)}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      draggable={false}
      className={cn(
        fill && "absolute inset-0 h-full w-full object-cover",
        className
      )}
      {...rest}
    />
  );
}
