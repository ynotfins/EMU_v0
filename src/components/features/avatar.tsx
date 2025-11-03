"use client";

import Image from "next/image";
import {
  getAvatarClasses,
  getInitials,
  getAvatarGradient,
  type AvatarProps,
} from "@/lib/avatar-utils";

/**
 * Avatar Component - Consistent 20% rounded corners everywhere
 * Use this component for ALL avatar displays in the app
 */
export function Avatar({ src, alt, size = "md", fallback }: AvatarProps) {
  const classes = getAvatarClasses(size);

  // Size mappings for Next.js Image
  const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  const pixelSize = sizeMap[size];

  if (src) {
    return (
      <div className={`${classes} relative`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover rounded-[20%]"
          sizes={`${pixelSize}px`}
        />
      </div>
    );
  }

  // Fallback: gradient with initials or emoji
  const gradient = getAvatarGradient(alt);
  const displayText = fallback || getInitials(alt);

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-base",
    lg: "text-xl",
    xl: "text-3xl",
  };

  return (
    <div
      className={`${classes} bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold ${textSizeClasses[size]} shadow-md`}
    >
      {displayText}
    </div>
  );
}

/**
 * Avatar with online status indicator
 */
export function AvatarWithStatus({
  src,
  alt,
  size = "md",
  fallback,
  online = false,
}: AvatarProps & { online?: boolean }) {
  const statusSizeMap = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
    xl: "w-5 h-5",
  };

  return (
    <div className="relative">
      <Avatar src={src} alt={alt} size={size} fallback={fallback} />
      {online && (
        <div
          className={`absolute bottom-0 right-0 ${statusSizeMap[size]} bg-green-500 border-2 border-white rounded-full`}
        />
      )}
    </div>
  );
}

/**
 * Avatar group (stacked avatars)
 */
export function AvatarGroup({
  avatars,
  max = 3,
  size = "md",
}: {
  avatars: Array<{ src?: string | null; alt: string; fallback?: string }>;
  max?: number;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const displayAvatars = avatars.slice(0, max);
  const remaining = Math.max(0, avatars.length - max);

  const sizeMap = {
    sm: "w-8",
    md: "w-12",
    lg: "w-16",
    xl: "w-24",
  };

  return (
    <div className="flex -space-x-2">
      {displayAvatars.map((avatar, index) => (
        <div
          key={index}
          className={`${sizeMap[size]} ring-2 ring-white`}
          style={{ zIndex: displayAvatars.length - index }}
        >
          <Avatar {...avatar} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={`${sizeMap[size]} ring-2 ring-white`}
          style={{ zIndex: 0 }}
        >
          <div
            className={`${getAvatarClasses(
              size
            )} bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-xs`}
          >
            +{remaining}
          </div>
        </div>
      )}
    </div>
  );
}
