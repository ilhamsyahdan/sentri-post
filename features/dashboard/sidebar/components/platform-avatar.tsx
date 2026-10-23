import Image from "next/image";

interface PlatformAvatarUrlProps {
  avatarUrl: string;
  size?: number;
}

export const PlatformAvatarUrl = ({
  avatarUrl,
  size = 14,
}: PlatformAvatarUrlProps) => (
  <Image
    src={avatarUrl}
    alt="channel avatar"
    width={size}
    height={size}
    className="object-cover w-full h-full"
    unoptimized
  />
);
