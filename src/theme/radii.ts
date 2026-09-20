/**
 * Corner radii — AGRO-SCAN spec: 6 (status tags/badges), 12 (inputs,
 * secondary buttons, thumbnails), 20 (diagnostic cards, photo frames),
 * 24 (modal sheets), full round (shutter, filter pills).
 */
export const radii = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  badge: 8,
  input: 16,
  button: 16,
  card: 20,
  photo: 24,
  modal: 28,
  pill: 999,
  /** Legacy alias: status tags. */
  chip: 8,
} as const;
