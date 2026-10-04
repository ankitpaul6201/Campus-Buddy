"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

export interface NavBarProps {
  items: NavItem[];
  activeTab?: string;
  onTabClick?: (item: NavItem) => void;
  className?: string;
}

export function NavBar({ items, activeTab: controlledActiveTab, onTabClick, className }: NavBarProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(items[0]?.name || "");
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const [, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClick = (e: React.MouseEvent, item: NavItem) => {
    e.preventDefault();
    setInternalActiveTab(item.name);
    if (onTabClick) {
      onTabClick(item);
    } else {
      const targetId = item.url.replace(/^#/, "");
      const lenis = (window as any).__lenis;
      if (lenis) {
        if (targetId === "home") {
          lenis.scrollTo(0, { duration: 1.2 });
        } else {
          const element = document.getElementById(targetId);
          if (element) {
            lenis.scrollTo(element, { offset: -70, duration: 1.2 });
          }
        }
      } else {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  return (
    <div className={cn("relative z-50", className)}>
      <div className="flex items-center gap-1 sm:gap-1.5 bg-white/95 border border-gray-200/90 backdrop-blur-md py-1 px-1.5 rounded-full shadow-[0_4px_20px_rgba(8,96,232,0.06)]">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab.toLowerCase() === item.name.toLowerCase();

          return (
            <a
              key={item.name}
              href={item.url}
              onClick={(e) => handleClick(e, item)}
              className={cn(
                "relative cursor-pointer text-[13px] font-semibold px-4 sm:px-5 py-1.5 rounded-full transition-colors duration-200 flex items-center gap-1.5 select-none transform-gpu",
                isActive
                  ? "text-brand-blue font-bold"
                  : "text-gray-600 hover:text-brand-dark"
              )}
            >
              <span className="md:hidden">
                <Icon size={16} strokeWidth={2.5} />
              </span>
              <span className="hidden md:inline">{item.name}</span>

              {/* Clean sliding active pill indicator with zero blurry circles */}
              {isActive && (
                <motion.div
                  layoutId="navbar-active-pill"
                  className="absolute inset-0 w-full bg-blue-50/90 border border-blue-200/60 rounded-full -z-10 shadow-xs transform-gpu will-change-transform"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 34,
                    mass: 0.8,
                  }}
                >
                  {/* Clean minimal top indicator line (no blur, no bulb, no purple/blue circle) */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-brand-blue rounded-full" />
                </motion.div>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default NavBar;
