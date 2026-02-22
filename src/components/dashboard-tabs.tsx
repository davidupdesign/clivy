// @ts-nocheck
"use client";

import { motion } from "framer-motion";

type Tab = {
  key: string;
  label: string;
};

export default function DashboardTabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex gap-1 border-b mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`relative px-5 pb-3 text-base transition-colors cursor-pointer -mb-px ${
            activeTab === tab.key
              ? "text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.label}
          {activeTab === tab.key && (
            <motion.div
              layoutId="tab-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
