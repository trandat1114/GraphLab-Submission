import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { getTour } from "./registry";

/** Launches the registered walkthrough for `key` (an App mode). No-op if nothing is registered for it. */
export function runTour(key: string) {
  const tour = getTour(key);
  if (!tour || tour.steps.length === 0) return;
  driver({
    animate: true,
    showProgress: true,
    smoothScroll: true,
    overlayOpacity: 0.65,
    stagePadding: 6,
    stageRadius: 10,
    popoverClass: "graphlab-tour",
    progressText: "{{current}} / {{total}}",
    prevBtnText: "← Trước",
    nextBtnText: "Tiếp →",
    doneBtnText: "Xong",
    closeBtnLabel: "Đóng",
    steps: tour.steps,
  }).drive();
}
