/**
 * Shared visual tokens for the light "Control Center" design. iOS system colors, deeper
 * text variants for readability on white, and soft Apple-style shadows.
 */
export const C = {
  canvas: "#F2F2F7", // iOS systemGray6
  card: "#FFFFFF",
  ink: "#1C1C1E", // primary text
  inkMute: "#8A8A8E", // secondary text
  hair: "#E5E5EA", // hairline border
  accent: "#007AFF", // iOS blue
  // Money semantics: bright fill + readable text variant
  greenFill: "#34C759",
  green: "#1E9E4A",
  redFill: "#FF3B30",
  red: "#E0352B",
  amberFill: "#FF9500",
  amber: "#E07E00",
} as const;

export const SHADOW_SM = "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04)";
export const SHADOW = "0 4px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.05)";
export const SHADOW_LG = "0 12px 32px rgba(0,0,0,0.10), 0 4px 10px rgba(0,0,0,0.05)";

/** iOS-style spring for framer-motion. */
export const SPRING = { type: "spring" as const, stiffness: 320, damping: 26 };
export const SPRING_SOFT = { type: "spring" as const, stiffness: 180, damping: 22 };
