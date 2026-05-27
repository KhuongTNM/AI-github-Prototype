"use client"

import { useState, useCallback, useRef } from "react"
import {
  Upload, FileText, Download, Trash2, Eye, MoreVertical, Search,
  Filter, Grid3X3, List, ChevronDown, X, CheckCircle2, AlertCircle,
  Loader2, ArrowUpDown, Tag, Clock, RefreshCw, Edit3, Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn, } from "@/lib/utils"
import { useApp, Document, formatBytes } from "@/lib/store"

// ─── Upload Progress ──────────────────────────────────────────────────────────
function UploadProgress({ doc }: { doc: Document }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="mb-2 flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 truncate text-sm font-medium text-foreground">{doc.name}</span>
        {doc.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        {doc.status === "scanning" && <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />}
        {doc.status === "ready" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
        {doc.status === "failed" && <AlertCircle className="h-4 w-4 text-destructive" />}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            doc.status === "failed" ? "bg-destructive" :
            doc.status === "ready" ? "bg-green-500" :
            doc.status === "scanning" ? "bg-yellow-500" : "bg-primary"
          )}
          style={{ width: `${doc.uploadProgress ?? 0}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {doc.status === "uploading" && `Đang tải lên... ${doc.uploadProgress ?? 0}%`}
        {doc.status === "scanning" && "Đang quét file an toàn..."}
        {doc.status === "ready" && "Hoàn thành!"}
        {doc.status === "failed" && "Upload thất bại. Thử lại?"}
      </p>
    </div>
  )
}

// ─── Document Preview Modal ───────────────────────────────────────────────────
function DocumentPreviewModal({ doc, onClose, onDownload }: { doc: Document; onClose: () => void; onDownload: (id: string) => void }) {
  const { categories } = useApp()
  const category = categories.find(c => c.id === doc.categoryId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-semibold text-foreground">Chi tiết tài liệu</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="p-6">
          {/* Preview Area */}
          <div className="mb-4 flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30">
            <div className="text-center">
              <div className={cn(
                "mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold",
                doc.type === "pdf" ? "bg-red-100 text-red-600" :
                doc.type === "docx" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
              )}>
                {doc.type.toUpperCase()}
              </div>
              <p className="text-sm text-muted-foreground">Preview không khả dụng trong chế độ prototype</p>
            </div>
          </div>
          {/* File Info */}
          <div className="space-y-3">
            <div>
              <h4 className="text-lg font-semibold text-foreground">{doc.name}</h4>
              {doc.description && <p className="mt-1 text-sm text-muted-foreground">{doc.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Loại file</p>
                <p className="font-medium text-foreground">{doc.type.toUpperCase()}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Kích thước</p>
                <p className="font-medium text-foreground">{doc.size}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Ngày upload</p>
                <p className="font-medium text-foreground">{doc.uploadedAt.toLocaleDateString("vi-VN")}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Lượt tải</p>
                <p className="font-medium text-foreground">{doc.downloadCount}</p>
              </div>
            </div>
            {category && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Môn học:</span>
                <span
                  className="rounded-full px-3 py-0.5 text-sm font-medium text-white"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name}
                </span>
              </div>
            )}
            {doc.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {doc.tags.map(tag => (
                  <span key={tag} className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 border-t border-border p-4">
          <Button className="flex-1 gap-2" onClick={() => onDownload(doc.id)}>
            <Download className="h-4 w-4" />
            Tải xuống
          </Button>
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Metadata Modal ──────────────────────────────────────────────────────
function EditDocModal({ doc, onClose }: { doc: Document; onClose: () => void }) {
  const { updateDocument, categories } = useApp()
  const [title, setTitle] = useState(doc.name)
  const [description, setDescription] = useState(doc.description || "")
  const [categoryId, setCategoryId] = useState(doc.categoryId)
  const [tags, setTags] = useState(doc.tags.join(", "))

  const handleSave = () => {
    updateDocument(doc.id, {
      name: title,
      description,
      categoryId,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-semibold text-foreground">Chỉnh sửa thông tin</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="space-y-4 p-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Tiêu đề tài liệu *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Mô tả</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Môn học</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Tags (cách nhau bởi dấu phẩy)</label>
            <input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="toán học, đại số, chương 1"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
        <div className="flex gap-2 border-t border-border p-4">
          <Button className="flex-1" onClick={handleSave} disabled={!title.trim()}>Lưu thay đổi</Button>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Document Card ────────────────────────────────────────────────────────────
const fileTypeColors: Record<string, string> = {
  pdf: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  docx: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  pptx: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
}

function DocumentCard({
  doc, viewMode, onPreview, onEdit, onDelete, onDownload, onChat, categories
}: {
  doc: Document
  viewMode: "grid" | "list"
  onPreview: (doc: Document) => void
  onEdit: (doc: Document) => void
  onDelete: (id: string) => void
  onDownload: (id: string) => void
  onChat: (doc: Document) => void
  categories: ReturnType<typeof useApp>["categories"]
}) {
  const category = categories.find(c => c.id === doc.categoryId)

  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/40 hover:shadow-sm">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold", fileTypeColors[doc.type])}>
          {doc.type.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{doc.size}</span>
            <span>•</span>
            <span>{doc.uploadedAt.toLocaleDateString("vi-VN")}</span>
            {category && (
              <>
                <span>•</span>
                <span className="rounded-full px-1.5 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: category.color }}>
                  {category.name}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onChat(doc)} title="Chat với AI">
            <span className="text-xs">💬</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDownload(doc.id)} title="Tải xuống">
            <Download className="h-3 w-3" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPreview(doc)}><Eye className="mr-2 h-4 w-4" />Xem chi tiết</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(doc)}><Edit3 className="mr-2 h-4 w-4" />Chỉnh sửa</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(doc.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Xóa</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  return (
    <div className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold", fileTypeColors[doc.type])}>
          {doc.type.toUpperCase()}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onPreview(doc)}><Eye className="mr-2 h-4 w-4" />Xem chi tiết</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(doc)}><Edit3 className="mr-2 h-4 w-4" />Chỉnh sửa</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload(doc.id)}><Download className="mr-2 h-4 w-4" />Tải xuống</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(doc.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Xóa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="mb-1 truncate text-sm font-semibold text-foreground">{doc.name}</p>
      {doc.description && <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">{doc.description}</p>}
      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span>{doc.size}</span>
        <span>•</span>
        <span>{doc.uploadedAt.toLocaleDateString("vi-VN")}</span>
      </div>
      {category && (
        <span className="mb-3 inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: category.color }}>
          {category.name}
        </span>
      )}
      <div className="flex gap-2">
        <Button size="sm" className="flex-1 gap-1 text-xs" onClick={() => onChat(doc)}>
          💬 Chat AI
        </Button>
        <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => onPreview(doc)}>
          <Eye className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

// ─── Main Document Manager ────────────────────────────────────────────────────
export function DocumentManager() {
  const { documents, categories, addDocument, deleteDocument, updateDocument, currentUser, setCurrentPage } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "name" | "size">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)
  const [editDoc, setEditDoc] = useState<Document | null>(null)
  const [uploading, setUploading] = useState<Document[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeDocs = documents.filter(d => d.status !== "deleted")

  // Filter & sort
  const filtered = activeDocs
    .filter(d => {
      const matchSearch = !searchQuery ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchCat = selectedCategory === "all" || d.categoryId === selectedCategory
      return matchSearch && matchCat
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortBy === "date") cmp = a.uploadedAt.getTime() - b.uploadedAt.getTime()
      else if (sortBy === "name") cmp = a.name.localeCompare(b.name)
      else cmp = a.sizeBytes - b.sizeBytes
      return sortOrder === "desc" ? -cmp : cmp
    })

  const simulateUpload = useCallback((files: File[]) => {
    if (!currentUser) return
    const validTypes = ["application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"]
    const valid = files.filter(f => validTypes.includes(f.type))
    if (!valid.length) return

    valid.forEach(file => {
      const ext = file.name.split(".").pop() as "pdf" | "docx" | "pptx"
      const newDoc: Document = {
        id: `doc-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: ext,
        size: formatBytes(file.size),
        sizeBytes: file.size,
        uploadedAt: new Date(),
        uploadedBy: currentUser.id,
        categoryId: categories[0]?.id || "cat-1",
        status: "uploading",
        uploadProgress: 0,
        tags: [],
        downloadCount: 0,
        isPublic: false,
      }

      addDocument(newDoc)

      // Simulate progress
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 20 + 5
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          updateDocument(newDoc.id, { status: "scanning", uploadProgress: 100 })
          setTimeout(() => {
            updateDocument(newDoc.id, { status: "ready", uploadProgress: 100 })
          }, 1200)
        } else {
          updateDocument(newDoc.id, { uploadProgress: Math.round(progress) })
        }
      }, 200)
    })
  }, [currentUser, categories, addDocument, updateDocument])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    simulateUpload(Array.from(e.dataTransfer.files))
  }, [simulateUpload])

  const handleDownload = (id: string) => {
    updateDocument(id, { downloadCount: (documents.find(d => d.id === id)?.downloadCount ?? 0) + 1 })
  }

  const handleChatWithDoc = (doc: Document) => {
    setCurrentPage("chat")
  }

  // Uploading docs (progress)
  const uploadingDocs = documents.filter(d => d.status === "uploading" || d.status === "scanning")

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Tài liệu của tôi</h1>
            <p className="text-sm text-muted-foreground">{activeDocs.length} tài liệu</p>
          </div>
          <Button
            id="upload-btn"
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={!currentUser}
          >
            <Upload className="h-4 w-4" />
            Upload tài liệu
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.pptx"
            multiple
            onChange={e => simulateUpload(Array.from(e.target.files || []))}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Upload in progress */}
        {uploadingDocs.length > 0 && (
          <div className="mb-4 space-y-2">
            <h3 className="text-sm font-medium text-foreground">Đang tải lên</h3>
            {uploadingDocs.map(doc => <UploadProgress key={doc.id} doc={doc} />)}
          </div>
        )}

        {/* Drop Zone (when no docs) */}
        {activeDocs.length === 0 && uploadingDocs.length === 0 && (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "mb-6 flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all",
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            )}
          >
            <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Kéo & thả tài liệu vào đây</p>
            <p className="text-xs text-muted-foreground">Hỗ trợ: PDF, DOCX, PPTX</p>
            <Button className="mt-3 gap-2" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" /> Chọn file
            </Button>
          </div>
        )}

        {/* Filters & Search */}
        {activeDocs.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="doc-search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tài liệu..."
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Category filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Filter className="h-3 w-3" />
                  {selectedCategory === "all" ? "Tất cả môn" : categories.find(c => c.id === selectedCategory)?.name}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedCategory("all")}>Tất cả môn học</DropdownMenuItem>
                <DropdownMenuSeparator />
                {categories.map(c => (
                  <DropdownMenuItem key={c.id} onClick={() => setSelectedCategory(c.id)}>
                    <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ArrowUpDown className="h-3 w-3" />
                  Sắp xếp
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => { setSortBy("date"); setSortOrder("desc") }}>Mới nhất</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy("date"); setSortOrder("asc") }}>Cũ nhất</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy("name"); setSortOrder("asc") }}>Tên A-Z</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy("name"); setSortOrder("desc") }}>Tên Z-A</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy("size"); setSortOrder("desc") }}>Lớn nhất</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode */}
            <div className="flex rounded-lg border border-border">
              <button
                onClick={() => setViewMode("grid")}
                className={cn("p-2 rounded-l-lg", viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn("p-2 rounded-r-lg", viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Drag overlay for documents view */}
        {activeDocs.length > 0 && (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "mb-4 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed py-3 text-sm transition-all",
              isDragging ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
            )}
          >
            <Upload className="h-4 w-4" />
            Kéo file vào đây để upload thêm
          </div>
        )}

        {/* Empty search state */}
        {filtered.length === 0 && activeDocs.length > 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium text-foreground">Không tìm thấy tài liệu</p>
            <p className="mt-1 text-sm text-muted-foreground">Thử tìm với từ khóa khác hoặc xóa bộ lọc</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => { setSearchQuery(""); setSelectedCategory("all") }}>
              Xóa bộ lọc
            </Button>
          </div>
        )}

        {/* Document Grid/List */}
        <div className={cn(
          viewMode === "grid"
            ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "space-y-2"
        )}>
          {filtered.map(doc => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              viewMode={viewMode}
              onPreview={setPreviewDoc}
              onEdit={setEditDoc}
              onDelete={deleteDocument}
              onDownload={handleDownload}
              onChat={handleChatWithDoc}
              categories={categories}
            />
          ))}
        </div>

        {/* Not logged in */}
        {!currentUser && (
          <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
            <p className="font-medium text-foreground">Đăng nhập để quản lý tài liệu của bạn</p>
            <p className="mt-1 text-sm text-muted-foreground">Lưu trữ, tìm kiếm và chia sẻ tài liệu học tập trên cloud</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {previewDoc && (
        <DocumentPreviewModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
          onDownload={handleDownload}
        />
      )}
      {editDoc && (
        <EditDocModal doc={editDoc} onClose={() => setEditDoc(null)} />
      )}
    </div>
  )
}
