"use client"

import { cn } from "@/lib/utils"
import {
  MessageCircle,
  FileText,
  Search,
  PenTool,
  LayoutGrid,
  Shield,
} from "lucide-react"

export type TabType = "chat" | "summary" | "detector" | "search"

interface ToolTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "summary", label: "Tóm tắt", icon: FileText },
  { id: "detector", label: "AI Detector", icon: Shield },
  { id: "search", label: "Tìm kiếm", icon: Search },
]

export function ToolTabs({ activeTab, onTabChange }: ToolTabsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1 rounded-full border border-border bg-card p-1.5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
            activeTab === tab.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <tab.icon className="h-4 w-4" />
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
