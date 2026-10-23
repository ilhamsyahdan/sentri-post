// components/ui/avatar-image.tsx
import Image, { ImageProps } from "next/image";

const CDN_DIRECT = ["fbcdn.net", "cdninstagram.com"];

const AvatarImage = ({ alt, src, className, style, ...props }: ImageProps) => {
  const srcStr = typeof src === "string" ? src : "";
  const isDirect = CDN_DIRECT.some((cdn) => srcStr.includes(cdn));

  if (isDirect) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={srcStr}
        alt={alt}
        className={className}
        style={style}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <Image src={src} alt={alt} className={className} style={style} {...props} />
  );
};

export default AvatarImage;
