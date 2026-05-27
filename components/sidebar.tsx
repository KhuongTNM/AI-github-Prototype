"use client"

import { useState } from "react"
import {
  MessageCircle, FolderOpen, Plus, FileText, Sparkles, Search, Cloud,
  ChevronDown, ChevronRight, GraduationCap, LayoutGrid, Home, Trash2,
  LayoutDashboard, User, LogIn, HardDrive, X, Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useApp, formatBytes } from "@/lib/store"

interface SidebarProps {
  onNewChat: () => void
}

type NavPage = "home" | "documents" | "chat" | "cloud" | "search" | "profile" | "admin" | "trash"

const navItems: { page: NavPage; icon: React.ElementType; label: string; adminOnly?: boolean }[] = [
  { page: "home", icon: Home, label: "Trang chủ" },
  { page: "chat", icon: MessageCircle, label: "AI Chatbot" },
  { page: "documents", icon: FolderOpen, label: "Tài liệu của tôi" },
  { page: "cloud", icon: Cloud, label: "Cloud Storage" },
  { page: "search", icon: Search, label: "Tìm kiếm" },
  { page: "trash", icon: Trash2, label: "Thùng rác" },
  { page: "admin", icon: LayoutDashboard, label: "Admin Panel", adminOnly: true },
]

export function Sidebar({ onNewChat }: SidebarProps) {
  const { currentUser, currentPage, setCurrentPage, chatSessions, activeChatId,
    setActiveChatId, openAuthModal, logout, documents } = useApp()

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    history: true,
    nav: true,
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleNav = (page: NavPage) => {
    if (page === "chat") { onNewChat() }
    setCurrentPage(page)
  }

  const storagePercent = currentUser
    ? Math.round((currentUser.storageUsed / currentUser.storageLimit) * 100)
    : 0

  const trashedCount = documents.filter(d => d.status === "deleted").length

  return (
    <aside className="flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
          <GraduationCap className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-sidebar-foreground">AI Study Hub</span>
        <Button variant="outline" size="icon" className="ml-auto h-8 w-8" onClick={() => setCurrentPage("home")}>
          <Home className="h-4 w-4" />
        </Button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 pb-4">
        <Button
          id="new-chat-btn"
          onClick={() => handleNav("chat")}
          variant="outline"
          className="w-full justify-start gap-2 border-border bg-background text-foreground hover:bg-muted"
        >
          <Plus className="h-4 w-4 rounded-full bg-primary/10 p-0.5 text-primary" />
          Cuộc hội thoại mới
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {/* Main Nav Items */}
        <div className="mb-3">
          <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            Menu
          </p>
          {navItems
            .filter(item => !item.adminOnly || currentUser?.role === "admin")
            .map(item => (
              <button
                key={item.page}
                id={`nav-${item.page}`}
                onClick={() => handleNav(item.page)}
                className={cn(
                  "relative flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                  currentPage === item.page
                    ? "bg-sidebar-accent font-medium text-sidebar-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
                {item.page === "trash" && trashedCount > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive/20 text-xs text-destructive font-medium">
                    {trashedCount}
                  </span>
                )}
                {item.page === "admin" && (
                  <span className="ml-auto rounded-full bg-orange-100 px-1.5 py-0.5 text-xs text-orange-700">
                    Admin
                  </span>
                )}
              </button>
            ))}
        </div>

        {/* Chat History Section */}
        {currentUser && (
          <div className="mb-3">
            <button
              onClick={() => toggleSection("history")}
              className="flex w-full items-center gap-2 py-2 text-sm text-muted-foreground px-2"
            >
              <Clock className="h-4 w-4" />
              <span>Lịch sử chat</span>
              {expandedSections.history ? (
                <ChevronDown className="ml-auto h-4 w-4" />
              ) : (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </button>
            {expandedSections.history && (
              <div className="ml-2 space-y-1">
                {chatSessions.length > 0 ? (
                  chatSessions.slice(0, 8).map(session => (
                    <button
                      key={session.id}
                      onClick={() => {
                        setActiveChatId(session.id)
                        setCurrentPage("chat")
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 truncate rounded-md px-2 py-1.5 text-sm",
                        activeChatId === session.id
                          ? "bg-sidebar-accent text-sidebar-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <MessageCircle className="h-3 w-3 shrink-0" />
                      <span className="truncate">{session.title}</span>
                    </button>
                  ))
                ) : (
                  <button
                    onClick={() => handleNav("chat")}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  >
                    <Plus className="h-3 w-3" />
                    Bắt đầu cuộc trò chuyện
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tools */}
        <div className="mb-3">
          <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            Công cụ AI
          </p>
          {[
            { icon: FileText, label: "Tóm tắt tài liệu" },
            { icon: LayoutGrid, label: "Tạo Flashcard" },
            { icon: Sparkles, label: "AI Writer" },
          ].map(tool => (
            <button
              key={tool.label}
              onClick={() => handleNav("chat")}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <tool.icon className="h-4 w-4" />
              {tool.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        {currentUser ? (
          <div className="space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                currentUser.role === "admin" ? "bg-orange-500 text-white" : "bg-primary text-primary-foreground"
              )}>
                {currentUser.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{currentUser.displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
            </div>
            {/* Storage Bar */}
            {currentUser.role !== "admin" && (
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><HardDrive className="h-3 w-3" /> Dung lượng</span>
                  <span>{formatBytes(currentUser.storageUsed)} / {formatBytes(currentUser.storageLimit)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className={cn("h-1.5 rounded-full transition-all", storagePercent > 80 ? "bg-destructive" : "bg-primary")}
                    style={{ width: `${storagePercent}%` }}
                  />
                </div>
              </div>
            )}
            <Button
              id="sidebar-logout"
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        ) : (
          <div className="rounded-lg bg-background p-4">
            <p className="mb-1 text-sm font-medium text-foreground">Đăng nhập miễn phí</p>
            <p className="mb-3 text-xs text-muted-foreground">
              Lưu lịch sử chat và tài liệu trên cloud.
            </p>
            <div className="flex gap-2">
              <Button
                id="sidebar-login"
                variant="outline"
                size="sm"
                className="flex-1 gap-1"
                onClick={() => openAuthModal("login")}
              >
                <LogIn className="h-3 w-3" />
                Đăng nhập
              </Button>
              <Button
                id="sidebar-register"
                size="sm"
                className="flex-1"
                onClick={() => openAuthModal("register")}
              >
                Đăng ký
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
