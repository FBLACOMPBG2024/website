import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// This uses the tailwind-merge package to merge the classes
// It uses the clsx package to merge the classes

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
