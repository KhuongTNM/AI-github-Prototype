"use client"

import { useState } from "react"
import {
  Users, FileText, LayoutDashboard, Tag, Flag, Search,
  Lock, Unlock, Trash2, CheckCircle2, AlertTriangle, X,
  TrendingUp, HardDrive, MessageCircle, Plus, Edit3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useApp, formatBytes } from "@/lib/store"

type AdminTab = "overview" | "users" | "documents" | "categories" | "reports"

export function AdminDashboard() {
  const {
    currentUser, users, documents, categories,
    toggleUserLock, deleteDocument, restoreDocument,
    addCategory, deleteCategory, setCurrentPage,
  } = useApp()

  const [tab, setTab] = useState<AdminTab>("overview")
  const [userSearch, setUserSearch] = useState("")
  const [docSearch, setDocSearch] = useState("")
  const [newCatName, setNewCatName] = useState("")
  const [newCatColor, setNewCatColor] = useState("#6366f1")
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string } | null>(null)

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h2 className="text-xl font-semibold text-foreground">Không có quyền truy cập</h2>
        <p className="text-muted-foreground">Chỉ Admin mới có thể truy cập trang này (BR-66)</p>
        <Button onClick={() => setCurrentPage("home")}>Về trang chủ</Button>
      </div>
    )
  }

  const activeDocs = documents.filter(d => d.status !== "deleted")
  const totalStorage = users.reduce((s, u) => s + u.storageUsed, 0)
  const lockedUsers = users.filter(u => u.isLocked).length

  const filteredUsers = users.filter(u =>
    !userSearch ||
    u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  const filteredDocs = activeDocs.filter(d =>
    !docSearch || d.name.toLowerCase().includes(docSearch.toLowerCase())
  )

  // Simulated reported docs
  const reportedDocs = activeDocs.slice(0, 1)

  const tabs = [
    { id: "overview" as AdminTab, label: "Tổng quan", icon: LayoutDashboard },
    { id: "users" as AdminTab, label: "Người dùng", icon: Users },
    { id: "documents" as AdminTab, label: "Tài liệu", icon: FileText },
    { id: "categories" as AdminTab, label: "Môn học", icon: Tag },
    { id: "reports" as AdminTab, label: "Báo cáo", icon: Flag },
  ]

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
            <LayoutDashboard className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Quản trị hệ thống AI Study Hub</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
              tab === t.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
            {t.id === "reports" && reportedDocs.length > 0 && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-white">
                {reportedDocs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { icon: Users, label: "Tổng người dùng", value: users.length, color: "text-primary", bg: "bg-primary/10" },
                { icon: FileText, label: "Tổng tài liệu", value: activeDocs.length, color: "text-blue-500", bg: "bg-blue-100" },
                { icon: HardDrive, label: "Tổng dung lượng", value: formatBytes(totalStorage), color: "text-green-500", bg: "bg-green-100" },
                { icon: Lock, label: "TK bị khóa", value: lockedUsers, color: "text-red-500", bg: "bg-red-100" },
              ].map(stat => (
                <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
                  <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent activity */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 font-semibold text-foreground">Người dùng gần đây</h3>
              <div className="space-y-2">
                {users.slice(0, 4).map(u => (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                      u.role === "admin" ? "bg-orange-500" : "bg-primary"
                    )}>
                      {u.displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{u.displayName}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    {u.isLocked && (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">Bị khóa</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="admin-user-search"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Tìm theo tên hoặc email (BR-77)..."
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              {filteredUsers.map(u => (
                <div key={u.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                    u.role === "admin" ? "bg-orange-500" : u.isLocked ? "bg-muted-foreground" : "bg-primary"
                  )}>
                    {u.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{u.displayName}</p>
                      <span className={cn(
                        "shrink-0 rounded-full px-1.5 py-0.5 text-xs font-medium",
                        u.role === "admin" ? "bg-orange-100 text-orange-700" : "bg-primary/10 text-primary"
                      )}>
                        {u.role}
                      </span>
                      {u.isLocked && (
                        <span className="shrink-0 rounded-full bg-destructive/10 px-1.5 py-0.5 text-xs text-destructive">Bị khóa</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email} • {u.lastActive.toLocaleDateString("vi-VN")}</p>
                  </div>
                  {u.id !== currentUser.id && (
                    <Button
                      size="sm"
                      variant={u.isLocked ? "outline" : "ghost"}
                      className={cn("gap-1.5 text-xs shrink-0", !u.isLocked && "text-destructive hover:text-destructive")}
                      onClick={() => toggleUserLock(u.id)}
                    >
                      {u.isLocked ? <><Unlock className="h-3 w-3" />Mở khóa</> : <><Lock className="h-3 w-3" />Khóa</>}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DOCUMENTS */}
        {tab === "documents" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="admin-doc-search"
                value={docSearch}
                onChange={e => setDocSearch(e.target.value)}
                placeholder="Tìm tài liệu (BR-78)..."
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              {filteredDocs.map(doc => {
                const cat = categories.find(c => c.id === doc.categoryId)
                const owner = users.find(u => u.id === doc.uploadedBy)
                return (
                  <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                      doc.type === "pdf" ? "bg-red-100 text-red-600" :
                      doc.type === "docx" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                    )}>
                      {doc.type.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>by {owner?.displayName ?? "?"}</span>
                        {cat && (
                          <>
                            <span>•</span>
                            <span className="rounded-full px-1.5 py-0.5 text-xs text-white" style={{ backgroundColor: cat.color }}>{cat.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 text-xs text-destructive hover:text-destructive"
                      onClick={() => deleteDocument(doc.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* CATEGORIES */}
        {tab === "categories" && (
          <div className="space-y-4">
            {/* Add new category */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 font-semibold text-foreground">Thêm môn học mới</h3>
              <div className="flex items-center gap-3">
                <input
                  id="new-cat-name"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="Tên môn học..."
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="color"
                  value={newCatColor}
                  onChange={e => setNewCatColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-lg border border-border"
                />
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={!newCatName.trim()}
                  onClick={() => {
                    addCategory(newCatName.trim(), newCatColor)
                    setNewCatName("")
                  }}
                >
                  <Plus className="h-3 w-3" />
                  Thêm
                </Button>
              </div>
            </div>

            {/* Category list */}
            <div className="space-y-2">
              {categories.map(cat => {
                const count = documents.filter(d => d.categoryId === cat.id && d.status !== "deleted").length
                return (
                  <div key={cat.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <div className="h-5 w-5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{count} tài liệu</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-destructive hover:text-destructive"
                      onClick={() => deleteCategory(cat.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* REPORTS */}
        {tab === "reports" && (
          <div className="space-y-4">
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
              <Flag className="h-4 w-4 shrink-0" />
              Các tài liệu được người dùng báo cáo vi phạm (BR-82)
            </div>
            {reportedDocs.map(doc => (
              <div key={doc.id} className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">{doc.size} • {doc.uploadedAt.toLocaleDateString("vi-VN")}</p>
                    <p className="mt-1 text-xs text-destructive">Lý do báo cáo: Nội dung vi phạm quy định</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs gap-1">
                      <CheckCircle2 className="h-3 w-3" />Bỏ qua
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="text-xs gap-1"
                      onClick={() => deleteDocument(doc.id)}
                    >
                      <Trash2 className="h-3 w-3" />Xóa
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {reportedDocs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="mb-3 h-10 w-10 text-green-500" />
                <p className="font-medium text-foreground">Không có báo cáo vi phạm</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
