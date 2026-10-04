import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const cardData = [
  {
    id: 1,
    title: "Student Community",
    description: "Connect and trade with verified peers across your campus network.",
    color: "rgba(8, 96, 232, 0.8)"
  },
  {
    id: 2,
    title: "Zero Commission",
    description: "Keep 100% of your earnings with direct student-to-student transactions.",
    color: "rgba(16, 185, 129, 0.8)"
  },
  {
    id: 3,
    title: "Safe Handover",
    description: "Inspect products in person at well-lit campus hubs before payment.",
    color: "rgba(249, 115, 22, 0.8)"
  },
  {
    id: 4,
    title: "Campus Skills",
    description: "Monetize your coding, photography, or design talents for fellow students.",
    color: "rgba(139, 92, 246, 0.8)"
  }
];
