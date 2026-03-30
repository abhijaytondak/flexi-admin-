"use client";

import React, { useState } from "react";
import { CalendarClock, ArrowRightLeft, BarChart3 } from "lucide-react";
import { DeadlineManager } from "./DeadlineManager";
import { CarryForwardEngine } from "./CarryForwardEngine";
import { FYEndSummary } from "./FYEndSummary";

type TabKey = "deadlines" | "carry_forward" | "fy_summary";

interface Tab {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { key: "deadlines", label: "Deadlines", icon: <CalendarClock size={16} /> },
  { key: "carry_forward", label: "Carry Forward", icon: <ArrowRightLeft size={16} /> },
  { key: "fy_summary", label: "FY Summary", icon: <BarChart3 size={16} /> },
];

export function FiscalSettings() {
  const [activeTab, setActiveTab] = useState<TabKey>("deadlines");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Tab Bar */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "2px solid var(--color-border)",
          marginBottom: 28,
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 20px",
                border: "none",
                background: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? "var(--brand-navy)" : "#6b7280",
                borderBottom: active ? "2px solid var(--brand-navy)" : "2px solid transparent",
                marginBottom: -2,
                transition: "color 0.15s, border-color 0.15s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = "var(--brand-navy)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = "#6b7280";
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "deadlines" && <DeadlineManager />}
        {activeTab === "carry_forward" && <CarryForwardEngine />}
        {activeTab === "fy_summary" && <FYEndSummary />}
      </div>
    </div>
  );
}
