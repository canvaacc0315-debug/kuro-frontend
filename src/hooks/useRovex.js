import { useContext } from "react";
import { RovexContext } from "../core/RovexProvider";

export function useRovex() {
  const ctx = useContext(RovexContext);
  if (!ctx) {
    throw new Error("useRovex must be used inside RovexProvider");
  }
  return ctx;
}