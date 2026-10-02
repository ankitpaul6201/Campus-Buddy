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
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className={cn("relative z-50", className)}>
      <div className="flex items-center gap-1.5 sm:gap-2 bg-white/90 border border-gray-200/80 backdrop-blur-xl py-1 px-1.5 rounded-full shadow-[0_6px_25px_rgba(8,96,232,0.08)]">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab.toLowerCase() === item.name.toLowerCase();

          return (
            <a
              key={item.name}
              href={item.url}
              onClick={(e) => handleClick(e, item)}
              className={cn(
                "relative cursor-pointer text-[13px] font-semibold px-3.5 sm:px-5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 select-none",
                "text-gray-600 hover:text-brand-dark",
                isActive && "bg-blue-50/60 text-brand-blue font-bold"
              )}
            >
              <span className="md:hidden">
                <Icon size={16} strokeWidth={2.5} />
              </span>
              <span className="hidden md:inline">{item.name}</span>

              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-brand-blue/10 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 30,
                  }}
                >
                  {/* Glowing Tubelight Lamp Effect */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-7 h-[3px] bg-brand-blue rounded-full shadow-[0_0_8px_#0860E8]">
                    <div className="absolute w-10 h-5 bg-brand-blue/35 rounded-full blur-md -top-2 -left-1.5" />
                    <div className="absolute w-7 h-5 bg-brand-blue/35 rounded-full blur-md -top-1" />
                    <div className="absolute w-3.5 h-3.5 bg-brand-blue/35 rounded-full blur-xs top-0 left-1.5" />
                  </div>
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
