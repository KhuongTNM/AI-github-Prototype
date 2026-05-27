"use client"

import { useMemo, useState } from "react"
import {
  Activity, Bell, CheckCircle2, FileText, Flag, HardDrive, KeyRound,
  LayoutDashboard, Lock, Plus, Search, Settings, ShieldCheck, SlidersHorizontal,
  Tag, Trash2, Unlock, Users, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useApp, formatBytes, type DocStatus } from "@/lib/store"

type AdminTab = "overview" | "users" | "documents" | "categories" | "reports" | "settings" | "logs"
type SensitiveAction = { label: string; run: () => void } | null

const copy = {
  vi: {
    deniedTitle: "Không có quyền truy cập",
    deniedBody: "Chỉ Admin mới có thể truy cập trang quản trị hệ thống (BR-66).",
    home: "Về trang chủ",
    title: "Admin Dashboard",
    subtitle: "Quản trị theo business rules BR-66 đến BR-82",
    overview: "Tổng quan",
    users: "Người dùng",
    documents: "Tài liệu",
    categories: "Môn học",
    reports: "Báo cáo",
    settings: "Cấu hình",
    logs: "Nhật ký",
    totalUsers: "Tổng người dùng",
    totalDocs: "Tổng tài liệu",
    storage: "Dung lượng",
    locked: "Tài khoản khóa",
    recentUsers: "Người dùng gần đây",
    activity: "Hoạt động người dùng",
    searchUsers: "Tìm theo tên hoặc email (BR-77)",
    searchDocs: "Tìm tài liệu",
    filterStatus: "Trạng thái",
    filterCategory: "Môn học",
    all: "Tất cả",
    lock: "Khóa",
    unlock: "Mở khóa",
    delete: "Xóa",
    addCategory: "Thêm môn học mới",
    categoryName: "Tên môn học",
    add: "Thêm",
    reportedDocs: "Tài liệu bị báo cáo (BR-82)",
    noReports: "Không có báo cáo vi phạm",
    ignore: "Bỏ qua",
    important: "Thao tác quan trọng cần xác thực lại mật khẩu Admin (BR-81).",
    password: "Mật khẩu Admin",
    confirm: "Xác nhận",
    cancel: "Hủy",
    invalidPassword: "Mật khẩu Admin không đúng.",
    settingsTitle: "Giới hạn upload và loại file (BR-71)",
    fileTypes: "Loại file cho phép",
    storageLimit: "Dung lượng mỗi user",
    notifyTitle: "Gửi thông báo đến người dùng (BR-79)",
    notifyPlaceholder: "Nội dung thông báo",
    send: "Gửi",
    adminCreate: "Tạo tài khoản Admin khác (BR-80)",
    displayName: "Tên hiển thị",
    createAdmin: "Tạo Admin",
    adminCreated: "Đã tạo tài khoản Admin.",
    demo: "Demo accounts: admin@aistudyhub.com / Admin123, student@aistudyhub.com / Student123",
    passwordHidden: "Mật khẩu người dùng không hiển thị trong dashboard (BR-75).",
  },
  en: {
    deniedTitle: "Access denied",
    deniedBody: "Only Admin users can access the system administration page (BR-66).",
    home: "Back home",
    title: "Admin Dashboard",
    subtitle: "Administration mapped to business rules BR-66 through BR-82",
    overview: "Overview",
    users: "Users",
    documents: "Documents",
    categories: "Subjects",
    reports: "Reports",
    settings: "Settings",
    logs: "Logs",
    totalUsers: "Total users",
    totalDocs: "Total documents",
    storage: "Storage used",
    locked: "Locked accounts",
    recentUsers: "Recent users",
    activity: "User activity",
    searchUsers: "Search by name or email (BR-77)",
    searchDocs: "Search documents",
    filterStatus: "Status",
    filterCategory: "Subject",
    all: "All",
    lock: "Lock",
    unlock: "Unlock",
    delete: "Delete",
    addCategory: "Add new subject",
    categoryName: "Subject name",
    add: "Add",
    reportedDocs: "Reported documents (BR-82)",
    noReports: "No reported documents",
    ignore: "Ignore",
    important: "Important Admin actions require password re-authentication (BR-81).",
    password: "Admin password",
    confirm: "Confirm",
    cancel: "Cancel",
    invalidPassword: "Admin password is incorrect.",
    settingsTitle: "Upload limits and allowed file types (BR-71)",
    fileTypes: "Allowed file types",
    storageLimit: "Storage per user",
    notifyTitle: "Send notification to users (BR-79)",
    notifyPlaceholder: "Notification message",
    send: "Send",
    adminCreate: "Create another Admin account (BR-80)",
    displayName: "Display name",
    createAdmin: "Create Admin",
    adminCreated: "Admin account created.",
    demo: "Demo accounts: admin@aistudyhub.com / Admin123, student@aistudyhub.com / Student123",
    passwordHidden: "User passwords are never shown in this dashboard (BR-75).",
  },
}

export function AdminDashboard() {
  const {
    currentUser, users, documents, categories, activityLogs, language,
    toggleUserLock, deleteDocument, addCategory, deleteCategory, setCurrentPage,
    createAdminAccount,
  } = useApp()

  const t = copy[language]
  const [tab, setTab] = useState<AdminTab>("overview")
  const [userSearch, setUserSearch] = useState("")
  const [docSearch, setDocSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<DocStatus | "all">("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [newCatName, setNewCatName] = useState("")
  const [newCatColor, setNewCatColor] = useState("#6366f1")
  const [sensitiveAction, setSensitiveAction] = useState<SensitiveAction>(null)
  const [adminPassword, setAdminPassword] = useState("")
  const [reauthError, setReauthError] = useState("")
  const [notice, setNotice] = useState("")
  const [adminForm, setAdminForm] = useState({ email: "", password: "", displayName: "" })
  const [adminMessage, setAdminMessage] = useState("")

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <ShieldCheck className="h-16 w-16 text-destructive" />
        <h2 className="text-xl font-semibold text-foreground">{t.deniedTitle}</h2>
        <p className="text-muted-foreground">{t.deniedBody}</p>
        <Button onClick={() => setCurrentPage("home")}>{t.home}</Button>
      </div>
    )
  }

  const activeDocs = documents.filter(d => d.status !== "deleted")
  const totalStorage = users.reduce((sum, user) => sum + user.storageUsed, 0)
  const lockedUsers = users.filter(user => user.isLocked).length
  const reportedDocs = activeDocs.slice(0, 2)

  const filteredUsers = users.filter(user =>
    !userSearch ||
    user.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  const filteredDocs = activeDocs.filter(doc => {
    const matchesText = !docSearch || doc.name.toLowerCase().includes(docSearch.toLowerCase())
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter
    const matchesCategory = categoryFilter === "all" || doc.categoryId === categoryFilter
    return matchesText && matchesStatus && matchesCategory
  })

  const activityByUser = useMemo(() => users.map(user => ({
    user,
    count: activityLogs.filter(log => log.userId === user.id).length,
  })), [activityLogs, users])

  const requirePassword = (label: string, run: () => void) => {
    setSensitiveAction({ label, run })
    setAdminPassword("")
    setReauthError("")
  }

  const confirmSensitiveAction = () => {
    if (adminPassword !== currentUser.password) {
      setReauthError(t.invalidPassword)
      return
    }
    sensitiveAction?.run()
    setSensitiveAction(null)
  }

  const tabs = [
    { id: "overview" as AdminTab, label: t.overview, icon: LayoutDashboard },
    { id: "users" as AdminTab, label: t.users, icon: Users },
    { id: "documents" as AdminTab, label: t.documents, icon: FileText },
    { id: "categories" as AdminTab, label: t.categories, icon: Tag },
    { id: "reports" as AdminTab, label: t.reports, icon: Flag },
    { id: "settings" as AdminTab, label: t.settings, icon: SlidersHorizontal },
    { id: "logs" as AdminTab, label: t.logs, icon: Activity },
  ]

  const statCards = [
    { icon: Users, label: t.totalUsers, value: users.length, color: "text-primary", bg: "bg-primary/10" },
    { icon: FileText, label: t.totalDocs, value: activeDocs.length, color: "text-blue-600", bg: "bg-blue-100" },
    { icon: HardDrive, label: t.storage, value: formatBytes(totalStorage), color: "text-green-600", bg: "bg-green-100" },
    { icon: Lock, label: t.locked, value: lockedUsers, color: "text-red-600", bg: "bg-red-100" },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <LayoutDashboard className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t.title}</h1>
              <p className="text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
          <div className="rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
            {t.demo}
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-border px-6">
        {tabs.map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
              tab === item.id ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
            {item.id === "reports" && reportedDocs.length > 0 && (
              <span className="rounded-full bg-destructive px-1.5 py-0.5 text-xs text-white">{reportedDocs.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map(stat => (
                <div key={stat.label} className="rounded-lg border border-border bg-card p-5">
                  <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-lg", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title={t.recentUsers}>
                {users.slice(0, 5).map(user => <UserRow key={user.id} user={user} />)}
              </Panel>
              <Panel title={t.activity}>
                {activityByUser.map(({ user, count }) => (
                  <div key={user.id} className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2 text-sm">
                    <span className="font-medium text-foreground">{user.displayName}</span>
                    <span className="text-muted-foreground">{count} logs</span>
                  </div>
                ))}
              </Panel>
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-4">
            <SearchInput value={userSearch} onChange={setUserSearch} placeholder={t.searchUsers} />
            <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">{t.passwordHidden}</p>
            {filteredUsers.map(user => (
              <div key={user.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
                <UserRow user={user} className="min-w-64 flex-1" />
                {user.id !== currentUser.id && (
                  <Button
                    size="sm"
                    variant={user.isLocked ? "outline" : "ghost"}
                    className={cn("gap-1.5 text-xs", !user.isLocked && "text-destructive hover:text-destructive")}
                    onClick={() => requirePassword(user.isLocked ? t.unlock : t.lock, () => toggleUserLock(user.id))}
                  >
                    {user.isLocked ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    {user.isLocked ? t.unlock : t.lock}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "documents" && (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_180px_220px]">
              <SearchInput value={docSearch} onChange={setDocSearch} placeholder={t.searchDocs} />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as DocStatus | "all")} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="all">{t.filterStatus}: {t.all}</option>
                {(["uploading", "scanning", "ready", "failed"] as DocStatus[]).map(status => <option key={status} value={status}>{status}</option>)}
              </select>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="all">{t.filterCategory}: {t.all}</option>
                {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </div>
            {filteredDocs.map(doc => {
              const owner = users.find(user => user.id === doc.uploadedBy)
              const category = categories.find(item => item.id === doc.categoryId)
              return (
                <div key={doc.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">{doc.type.toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.size} • {owner?.displayName} • {category?.name} • {doc.status}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => requirePassword(t.delete, () => deleteDocument(doc.id))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        {tab === "categories" && (
          <div className="space-y-4">
            <Panel title={t.addCategory}>
              <div className="flex flex-wrap items-center gap-3">
                <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder={t.categoryName} className="min-w-56 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                <input type="color" value={newCatColor} onChange={e => setNewCatColor(e.target.value)} className="h-9 w-12 rounded-lg border border-border" />
                <Button disabled={!newCatName.trim()} onClick={() => requirePassword(t.add, () => { addCategory(newCatName.trim(), newCatColor); setNewCatName("") })}>
                  <Plus className="mr-2 h-4 w-4" />{t.add}
                </Button>
              </div>
            </Panel>
            {categories.map(category => (
              <div key={category.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <div className="h-5 w-5 rounded-full" style={{ backgroundColor: category.color }} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{category.name}</p>
                  <p className="text-xs text-muted-foreground">{documents.filter(doc => doc.categoryId === category.id && doc.status !== "deleted").length} documents</p>
                </div>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => requirePassword(t.delete, () => deleteCategory(category.id))}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {tab === "reports" && (
          <div className="space-y-4">
            <div className="rounded-lg bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">{t.reportedDocs}</div>
            {reportedDocs.length === 0 ? <EmptyState text={t.noReports} /> : reportedDocs.map(doc => (
              <div key={doc.id} className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">{doc.size} • {doc.uploadedAt.toLocaleDateString(language === "vi" ? "vi-VN" : "en-US")}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"><CheckCircle2 className="mr-2 h-4 w-4" />{t.ignore}</Button>
                    <Button size="sm" variant="destructive" onClick={() => requirePassword(t.delete, () => deleteDocument(doc.id))}><Trash2 className="mr-2 h-4 w-4" />{t.delete}</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "settings" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title={t.settingsTitle}>
              <div className="space-y-3 text-sm">
                <label className="block">
                  <span className="mb-1 block text-muted-foreground">{t.fileTypes}</span>
                  <input defaultValue="PDF, DOCX, PPTX" className="w-full rounded-lg border border-border bg-background px-3 py-2" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-muted-foreground">{t.storageLimit}</span>
                  <input defaultValue="512 MB" className="w-full rounded-lg border border-border bg-background px-3 py-2" />
                </label>
              </div>
            </Panel>
            <Panel title={t.notifyTitle}>
              <textarea value={notice} onChange={e => setNotice(e.target.value)} placeholder={t.notifyPlaceholder} className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <Button className="mt-3" disabled={!notice.trim()} onClick={() => setNotice("")}><Bell className="mr-2 h-4 w-4" />{t.send}</Button>
            </Panel>
            <Panel title={t.adminCreate}>
              <div className="space-y-3">
                <input value={adminForm.displayName} onChange={e => setAdminForm({ ...adminForm, displayName: e.target.value })} placeholder={t.displayName} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                <input value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} placeholder="admin2@example.com" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                <input type="password" value={adminForm.password} onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} placeholder={t.password} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                <Button onClick={() => requirePassword(t.createAdmin, () => {
                  const result = createAdminAccount(adminForm.email, adminForm.password, adminForm.displayName)
                  setAdminMessage(result.success ? t.adminCreated : result.error ?? "")
                  if (result.success) setAdminForm({ email: "", password: "", displayName: "" })
                })}><KeyRound className="mr-2 h-4 w-4" />{t.createAdmin}</Button>
                {adminMessage && <p className="text-sm text-muted-foreground">{adminMessage}</p>}
              </div>
            </Panel>
          </div>
        )}

        {tab === "logs" && (
          <div className="space-y-3">
            {activityLogs.map(log => {
              const user = users.find(item => item.id === log.userId)
              return (
                <div key={log.id} className="rounded-lg border border-border bg-card p-3">
                  <p className="text-sm font-medium text-foreground">{log.action}</p>
                  <p className="text-xs text-muted-foreground">{user?.displayName ?? log.userId} • {log.target} • {log.timestamp.toLocaleString(language === "vi" ? "vi-VN" : "en-US")}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {sensitiveAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">{sensitiveAction.label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.important}</p>
            <input
              type="password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              placeholder={t.password}
              className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            {reauthError && <p className="mt-2 text-sm text-destructive">{reauthError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSensitiveAction(null)}>{t.cancel}</Button>
              <Button onClick={confirmSensitiveAction}>{t.confirm}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 font-semibold text-foreground">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-border bg-background py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
    </div>
  )
}

function UserRow({ user, className }: { user: { displayName: string; email: string; role: string; isLocked: boolean; lastActive: Date }; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white", user.role === "admin" ? "bg-orange-500" : user.isLocked ? "bg-muted-foreground" : "bg-primary")}>
        {user.displayName.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{user.displayName}</p>
          <span className={cn("rounded-full px-1.5 py-0.5 text-xs font-medium", user.role === "admin" ? "bg-orange-100 text-orange-700" : "bg-primary/10 text-primary")}>{user.role}</span>
          {user.isLocked && <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-xs text-destructive">locked</span>}
        </div>
        <p className="truncate text-xs text-muted-foreground">{user.email} • {user.lastActive.toLocaleDateString()}</p>
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
      <CheckCircle2 className="mb-3 h-10 w-10 text-green-500" />
      <p className="font-medium text-foreground">{text}</p>
    </div>
  )
}
