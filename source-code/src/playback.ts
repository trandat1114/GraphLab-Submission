export const SPEEDS = [1, 2, 4, 8] as const;
export type Speed = typeof SPEEDS[number];

/** Autoplay tick interval: a full trace always plays back in roughly the same
 * wall-clock time, however many steps it has, then speeds further with `speed`. */
export function playbackInterval(totalSteps: number, speed: Speed): number {
  const base = Math.min(300, Math.max(15, 5000 / Math.max(totalSteps, 1)));
  return base / speed;
}

export function nextSpeed(speed: Speed): Speed {
  const i = SPEEDS.indexOf(speed);
  return SPEEDS[(i + 1) % SPEEDS.length];
}
