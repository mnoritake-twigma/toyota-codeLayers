import { forwardRef, useState } from "react";
export interface AssetImageProps {
  src?: string;
  alt: string;
  variant?: "dealer" | "model" | "dealer-cover";
}
const ImageFrame = forwardRef<HTMLDivElement, AssetImageProps>(
  function ImageFrame({ src, alt, variant = "dealer" }, ref) {
    const [failed, setFailed] = useState(false);
    const fallback = !src || failed;
    return (
      <div
        ref={ref}
        className={`ds-placeholder-image ds-placeholder-image--${variant} ds-asset-image`}
        role={fallback ? "img" : undefined}
        aria-label={fallback ? `${alt}（プレースホルダ）` : undefined}
      >
        <span aria-hidden="true">LUMIÈRE</span>
        {!fallback && (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
        )}
      </div>
    );
  },
);
// A changed source remounts the frame so an earlier failure never hides a new asset.
export const AssetImage = forwardRef<HTMLDivElement, AssetImageProps>(
  function AssetImage(props, ref) {
    return <ImageFrame key={props.src ?? "missing"} {...props} ref={ref} />;
  },
);
