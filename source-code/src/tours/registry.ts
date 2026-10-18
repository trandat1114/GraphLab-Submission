import type { Tour } from "./types";
import { graphTour } from "./graphTour";
import { knightTour } from "./knightTour";

const registry = new Map<string, Tour>();

/** Call once per new mode (see AGENT.md) to make its walkthrough reachable from the Guide button. */
export function registerTour(tour: Tour) {
  registry.set(tour.key, tour);
}

export function getTour(key: string): Tour | undefined {
  return registry.get(key);
}

registerTour(graphTour);
registerTour(knightTour);
