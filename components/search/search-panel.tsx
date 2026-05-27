"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Search, X, Clock, FileText, Filter, ChevronDown,
  Tag, TrendingUp, AlertCircle, ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useApp, Document } from "@/lib/store"

const fileTypeColors: Record<string, string> = {
  pdf: "bg-red-100 text-red-600",
  docx: "bg-blue-100 text-blue-600",
  pptx: "bg-orange-100 text-orange-600",
}

export function SearchPanel() {
  const {
    documents, categories, searchHistory, addSearchHistory,
    currentUser, setCurrentPage,
  } = useApp()

  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [hasSearched, setHasSearched] = useState(false)

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(t)
  }, [query])

  const handleSearch = useCallback((q: string) => {
    if (!q.trim()) return
    addSearchHistory(q)
    setHasSearched(true)
  }, [addSearchHistory])

  const results: Document[] = debouncedQuery
    ? documents.filter(d => {
        if (d.status === "deleted") return false
        const matchSearch =
          d.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          d.tags.some(t => t.toLowerCase().includes(debouncedQuery.toLowerCase())) ||
          (d.description ?? "").toLowerCase().includes(debouncedQuery.toLowerCase())
        const matchCat = selectedCategory === "all" || d.categoryId === selectedCategory
        return matchSearch && matchCat
      })
    : []

  const popularSearches = ["giải tích", "lập trình", "OOP", "tiếng anh", "kinh tế", "vật lý"]

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <h1 className="mb-4 text-xl font-bold text-foreground">Tìm kiếm tài liệu</h1>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              id="global-search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSearch(query) }}
              placeholder="Tìm kiếm tên tài liệu, tag, mô tả..."
              className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setDebouncedQuery(""); setHasSearched(false) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1.5 shrink-0">
                <Filter className="h-4 w-4" />
                {selectedCategory === "all" ? "Tất cả" : categories.find(c => c.id === selectedCategory)?.name}
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

          <Button onClick={() => handleSearch(query)} disabled={!query.trim()} className="shrink-0">
            Tìm kiếm
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Initial state */}
        {!debouncedQuery && (
          <div className="space-y-6">
            {/* Search History */}
            {currentUser && searchHistory.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Clock className="h-4 w-4" />
                  Tìm kiếm gần đây
                </h3>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setQuery(item.query)}
                      className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
                    >
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {item.query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular searches */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <TrendingUp className="h-4 w-4" />
                Tìm kiếm phổ biến
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map(s => (
                  <button
                    key={s}
                    onClick={() => { setQuery(s); handleSearch(s) }}
                    className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Tag className="h-3 w-3" />
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* All Categories */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-foreground">Duyệt theo môn học</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {categories.map(cat => {
                  const count = documents.filter(d => d.categoryId === cat.id && d.status !== "deleted").length
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); setQuery(cat.name); handleSearch(cat.name) }}
                      className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
                    >
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-center text-xs font-medium text-foreground">{cat.name}</span>
                      <span className="text-xs text-muted-foreground">{count} tài liệu</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {debouncedQuery && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {results.length > 0
                  ? <>Tìm thấy <strong className="text-foreground">{results.length}</strong> kết quả cho "<strong className="text-foreground">{debouncedQuery}</strong>"</>
                  : "Không tìm thấy kết quả"}
              </p>
            </div>

            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertCircle className="mb-3 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-semibold text-foreground">Không tìm thấy tài liệu</h3>
                <p className="text-sm text-muted-foreground">
                  Không có tài liệu nào khớp với "<strong>{debouncedQuery}</strong>"
                </p>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p>Thử:</p>
                  <ul className="list-disc text-left">
                    <li>Kiểm tra lại chính tả</li>
                    <li>Dùng từ khóa ngắn hơn</li>
                    <li>Tìm với tag hoặc tên môn học</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map(doc => {
                  const category = categories.find(c => c.id === doc.categoryId)
                  // Highlight matching text
                  const highlightName = (text: string) => {
                    if (!debouncedQuery) return text
                    const idx = text.toLowerCase().indexOf(debouncedQuery.toLowerCase())
                    if (idx === -1) return text
                    return (
                      <>
                        {text.slice(0, idx)}
                        <mark className="bg-primary/20 text-primary rounded px-0.5">{text.slice(idx, idx + debouncedQuery.length)}</mark>
                        {text.slice(idx + debouncedQuery.length)}
                      </>
                    )
                  }

                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
                    >
                      <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                        fileTypeColors[doc.type]
                      )}>
                        {doc.type.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{highlightName(doc.name)}</p>
                        {doc.description && (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">{doc.description}</p>
                        )}
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-muted-foreground">{doc.size}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{doc.uploadedAt.toLocaleDateString("vi-VN")}</span>
                          {category && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span
                                className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                                style={{ backgroundColor: category.color }}
                              >
                                {category.name}
                              </span>
                            </>
                          )}
                          {doc.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1 text-xs"
                          onClick={() => setCurrentPage("documents")}
                        >
                          Xem
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
