import type { DriveStep } from "driver.js";

/** One guided walkthrough for a GraphLab mode. See AGENT.md for how to write and register a new one. */
export interface Tour {
  /** Unique key, matches the App `mode` value this tour explains. */
  key: string;
  /** Shown as the tour's label, e.g. on a "Choose a guide" menu if there is more than one. */
  title: string;
  /** driver.js steps, in the order they should be shown. Each `element` must exist in the DOM for that mode. */
  steps: DriveStep[];
}
