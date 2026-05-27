"use client"

import { useState } from "react"
import {
  Cloud, HardDrive, Upload, FileText, CheckCircle2,
  AlertCircle, RefreshCw, Shield, Wifi, Zap,
  Trash2, CloudUpload, Lock, Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useApp, formatBytes, Document } from "@/lib/store"

export function CloudStorage() {
  const { currentUser, documents, openAuthModal, syncDocumentToCloud } = useApp()
  const [syncing, setSyncing] = useState(false)
  const [syncDone, setSyncDone] = useState(false)
  const [syncingDocId, setSyncingDocId] = useState<string | null>(null)

  if (!currentUser) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5">
          <Cloud className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Google Cloud Storage</h2>
        <p className="text-muted-foreground">Đăng nhập để truy cập và đồng bộ tài liệu của bạn</p>
        <Button onClick={() => openAuthModal("login")}>Đăng nhập ngay</Button>
      </div>
    )
  }

  // Active documents
  const activeDocs = documents.filter(d => d.status === "ready")
  
  // Synced documents
  const syncedDocs = activeDocs.filter(d => d.syncedToCloud === true)
  
  // Unsynced documents
  const unsyncedDocs = activeDocs.filter(d => !d.syncedToCloud)

  // Calculate storage metrics
  const syncedStorageBytes = syncedDocs.reduce((sum, d) => sum + d.sizeBytes, 0)
  const storagePercent = Math.round((currentUser.storageUsed / currentUser.storageLimit) * 100)
  const totalDownloads = syncedDocs.reduce((sum, d) => sum + d.downloadCount, 0)

  // Global Sync: Sync all unsynced documents
  const handleSyncAll = async () => {
    if (unsyncedDocs.length === 0) return
    setSyncing(true)
    await new Promise(r => setTimeout(r, 2000))
    
    // Sync all unsynced files
    unsyncedDocs.forEach(doc => {
      syncDocumentToCloud(doc.id, true)
    })
    
    setSyncing(false)
    setSyncDone(true)
    setTimeout(() => setSyncDone(false), 3000)
  }

  // Sync a single document
  const handleSyncSingle = async (docId: string) => {
    setSyncingDocId(docId)
    await new Promise(r => setTimeout(r, 1200))
    syncDocumentToCloud(docId, true)
    setSyncingDocId(null)
  }

  // Delete a document from cloud storage
  const handleDeleteFromCloud = (docId: string) => {
    syncDocumentToCloud(docId, false)
  }

  const stats = [
    { icon: Cloud, label: "Đã đồng bộ", value: `${syncedDocs.length} file`, color: "text-blue-500 bg-blue-500/10" },
    { icon: HardDrive, label: "Dung lượng cloud", value: formatBytes(syncedStorageBytes), color: "text-cyan-500 bg-cyan-500/10" },
    { icon: Wifi, label: "Kết nối Cloud", value: "Đang kết nối", color: "text-green-500 bg-green-500/10" },
    { icon: Shield, label: "Mã hóa bảo mật", value: "AES-256", color: "text-purple-500 bg-purple-500/10" },
  ]

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 p-[2px]">
              <div className="flex h-full w-full items-center justify-center rounded-[9px] bg-background">
                <Cloud className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                Google Cloud Storage
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  Official Integration
                </span>
              </h1>
              <p className="text-sm text-muted-foreground">Sao lưu, đồng bộ hóa và quản lý tập tin an toàn trên nền tảng Google Cloud</p>
            </div>
          </div>
          {unsyncedDocs.length > 0 && (
            <Button
              id="sync-btn"
              onClick={handleSyncAll}
              disabled={syncing}
              className={cn("gap-2 shadow-sm font-semibold transition-all", 
                syncDone ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              {syncing ? (
                <><RefreshCw className="h-4 w-4 animate-spin" />Đang đồng bộ...</>
              ) : syncDone ? (
                <><CheckCircle2 className="h-4 w-4" />Đã đồng bộ thành công!</>
              ) : (
                <><CloudUpload className="h-4 w-4" />Đồng bộ tất cả ({unsyncedDocs.length})</>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Storage Summary */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-gradient-to-br from-blue-50/50 via-background to-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Cloud className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Dung lượng tài khoản</h3>
                <p className="text-sm text-muted-foreground">
                  {formatBytes(currentUser.storageUsed)} / {formatBytes(currentUser.storageLimit)} ({storagePercent}% đã dùng)
                </p>
              </div>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  storagePercent > 80 ? "bg-red-500" : storagePercent > 60 ? "bg-yellow-500" : "bg-blue-500"
                )}
                style={{ width: `${storagePercent}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{storagePercent}% đã sử dụng</span>
              <span>{formatBytes(currentUser.storageLimit - currentUser.storageUsed)} còn trống</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">
              <Wifi className="h-4 w-4 animate-pulse" />
              <span>Google Cloud Synced</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tài liệu của bạn được đồng bộ tự động lên cụm máy chủ khu vực Đông Nam Á của Google Cloud Platform, đảm bảo tốc độ truy cập tối đa và tính sẵn sàng cao.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map(stat => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 shadow-xs">
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sync Security Checklist */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4 dark:border-blue-900/30 dark:bg-blue-950/10">
          <h4 className="mb-2 flex items-center gap-2 font-semibold text-blue-800 dark:text-blue-400 text-sm">
            <Shield className="h-4 w-4 text-blue-500" />
            Bảo mật & Đồng bộ hóa Google Cloud
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-blue-700 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span>Đồng bộ hóa tức thời qua Google Cloud Storage API</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span>Mã hóa AES-256 đầu cuối khi lưu trữ</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span>Sao lưu dữ liệu tự động định kỳ</span>
            </div>
          </div>
        </div>

        {/* Main section splits */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Cloud Storage Files List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                Tài liệu trên Google Cloud ({syncedDocs.length})
              </h3>
              {syncedDocs.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-full">
                  <Wifi className="h-3 w-3" /> Online
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
              {syncedDocs.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-xs transition-colors hover:bg-muted/10 group"
                >
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    doc.type === "pdf" ? "bg-red-100 text-red-600 dark:bg-red-900/20" :
                    doc.type === "docx" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20" : "bg-orange-100 text-orange-600 dark:bg-orange-900/20"
                  )}>
                    {doc.type.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.size} • {doc.uploadedAt.toLocaleDateString("vi-VN")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-md">
                      <Check className="h-3 w-3" />
                      <span>Đã sync</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteFromCloud(doc.id)}
                      title="Xóa khỏi Google Cloud Storage"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {syncedDocs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl">
                  <Cloud className="mb-3 h-10 w-10 text-muted-foreground/60" />
                  <p className="font-semibold text-foreground text-sm">Chưa có tập tin nào được đồng bộ</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">Hãy chọn tài liệu ở danh sách bên cạnh để bắt đầu đồng bộ lên Google Cloud</p>
                </div>
              )}
            </div>
          </div>

          {/* Local files list ready to sync */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                Tài liệu chưa đồng bộ ({unsyncedDocs.length})
              </h3>
              {unsyncedDocs.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-yellow-600 font-medium bg-yellow-50 dark:bg-yellow-950/20 px-2 py-0.5 rounded-full">
                  Cần đồng bộ
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
              {unsyncedDocs.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-xs transition-colors hover:bg-muted/10"
                >
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    doc.type === "pdf" ? "bg-red-50 text-red-500 dark:bg-red-900/10" :
                    doc.type === "docx" ? "bg-blue-50 text-blue-500 dark:bg-blue-900/10" : "bg-orange-50 text-orange-500 dark:bg-orange-900/10"
                  )}>
                    {doc.type.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.size} • Chưa đồng bộ</p>
                  </div>
                  <div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={syncingDocId === doc.id}
                      onClick={() => handleSyncSingle(doc.id)}
                      className="gap-1 px-3 text-xs border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 text-blue-600 dark:border-blue-900/50 dark:hover:bg-blue-950/30"
                    >
                      {syncingDocId === doc.id ? (
                        <><RefreshCw className="h-3 w-3 animate-spin text-blue-500" />Đang sync...</>
                      ) : (
                        <><CloudUpload className="h-3 w-3 text-blue-500" />Đồng bộ</>
                      )}
                    </Button>
                  </div>
                </div>
              ))}

              {unsyncedDocs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl bg-green-50/10 dark:bg-green-950/5">
                  <CheckCircle2 className="mb-3 h-10 w-10 text-green-500" />
                  <p className="font-semibold text-foreground text-sm">Tuyệt vời!</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">Tất cả tài liệu của bạn đã được đồng bộ hóa lên Google Cloud Storage.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
