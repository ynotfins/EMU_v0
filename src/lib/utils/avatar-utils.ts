/**
 * Avatar utility functions
 * Ensures all avatars have consistent 20% rounded corners
 */

/**
 * Get avatar CSS classes with 20% border radius
 * Use this for ALL avatar displays to maintain consistency
 */
export function getAvatarClasses(
  size: "sm" | "md" | "lg" | "xl" = "md"
): string {
  const sizeClasses = {
    sm: "w-8 h-8", // 32px - bottom nav, small icons
    md: "w-12 h-12", // 48px - chat, cards
    lg: "w-16 h-16", // 64px - profile headers
    xl: "w-24 h-24", // 96px - large profile displays
  };

  // 20% rounded corners = rounded-[20%]
  return `${sizeClasses[size]} rounded-[20%] object-cover`;
}

/**
 * Avatar container component classes
 * For divs that contain avatar images
 */
export function getAvatarContainerClasses(
  size: "sm" | "md" | "lg" | "xl" = "md"
): string {
  return `${getAvatarClasses(size)} overflow-hidden`;
}

/**
 * Process uploaded avatar to ensure 20% rounded corners
 * This would be used server-side or in an image processing function
 */
export async function processAvatarImage(
  file: File,
  targetSize: number = 512
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Create canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Set canvas size
        canvas.width = targetSize;
        canvas.height = targetSize;

        // Calculate 20% border radius
        const borderRadius = targetSize * 0.2;

        // Draw rounded rectangle clipping path
        ctx.beginPath();
        ctx.moveTo(borderRadius, 0);
        ctx.lineTo(targetSize - borderRadius, 0);
        ctx.quadraticCurveTo(targetSize, 0, targetSize, borderRadius);
        ctx.lineTo(targetSize, targetSize - borderRadius);
        ctx.quadraticCurveTo(
          targetSize,
          targetSize,
          targetSize - borderRadius,
          targetSize
        );
        ctx.lineTo(borderRadius, targetSize);
        ctx.quadraticCurveTo(0, targetSize, 0, targetSize - borderRadius);
        ctx.lineTo(0, borderRadius);
        ctx.quadraticCurveTo(0, 0, borderRadius, 0);
        ctx.closePath();
        ctx.clip();

        // Calculate dimensions to fill canvas (cover behavior)
        const scale = Math.max(targetSize / img.width, targetSize / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (targetSize - scaledWidth) / 2;
        const y = (targetSize - scaledHeight) / 2;

        // Draw image
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob"));
            }
          },
          "image/png",
          0.95
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Avatar display component
 * Reusable component for consistent avatar rendering
 */
export interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallback?: string; // Emoji or initial
}

/**
 * Get initials from name for fallback avatar
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}

/**
 * Avatar gradient backgrounds (for when no image is set)
 */
export const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-green-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-indigo-500 to-purple-600",
  "from-teal-500 to-cyan-600",
  "from-red-500 to-pink-600",
  "from-yellow-500 to-orange-600",
];

/**
 * Get consistent gradient for a user (based on ID or name)
 */
export function getAvatarGradient(id: string): string {
  const index =
    id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}
