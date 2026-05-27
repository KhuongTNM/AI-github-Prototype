"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"

// ─── Types ──────────────────────────────────────────────────────────────────

export type UserRole = "guest" | "user" | "admin"

export interface User {
  id: string
  email: string
  displayName: string
  password: string
  avatar?: string
  role: UserRole
  isLocked: boolean
  emailVerified: boolean
  createdAt: Date
  loginAttempts: number
  lastActive: Date
  storageUsed: number // bytes
  storageLimit: number // bytes
}

export interface Category {
  id: string
  name: string
  color: string
}

export type DocStatus = "uploading" | "scanning" | "ready" | "failed" | "deleted"

export interface Document {
  id: string
  name: string
  type: "pdf" | "docx" | "pptx"
  size: string
  sizeBytes: number
  uploadedAt: Date
  uploadedBy: string // userId
  categoryId: string
  status: DocStatus
  uploadProgress?: number
  description?: string
  tags: string[]
  downloadCount: number
  isPublic: boolean
  syncedToCloud?: boolean
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  documentId?: string
  createdAt: Date
}

export interface ActivityLog {
  id: string
  userId: string
  action: string
  target: string
  timestamp: Date
}

export interface SearchHistoryItem {
  id: string
  query: string
  timestamp: Date
}

export type Language = "vi" | "en"

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Toán học", color: "#6366f1" },
  { id: "cat-2", name: "Vật lý", color: "#0ea5e9" },
  { id: "cat-3", name: "Hóa học", color: "#10b981" },
  { id: "cat-4", name: "Lập trình", color: "#f59e0b" },
  { id: "cat-5", name: "Kinh tế", color: "#ef4444" },
  { id: "cat-6", name: "Tiếng Anh", color: "#8b5cf6" },
]

const MOCK_ADMIN: User = {
  id: "user-admin",
  email: "admin@aistudyhub.com",
  displayName: "Admin System",
  password: "Admin123",
  role: "admin",
  isLocked: false,
  emailVerified: true,
  createdAt: new Date("2026-01-01"),
  loginAttempts: 0,
  lastActive: new Date(),
  storageUsed: 1024 * 1024 * 200,
  storageLimit: 1024 * 1024 * 1024 * 5,
}

const MOCK_USERS: User[] = [
  MOCK_ADMIN,
  {
    id: "user-1",
    email: "student@aistudyhub.com",
    displayName: "Demo Student",
    password: "Student123",
    role: "user",
    isLocked: false,
    emailVerified: true,
    createdAt: new Date("2026-03-10"),
    loginAttempts: 0,
    lastActive: new Date("2026-05-26"),
    storageUsed: 1024 * 1024 * 45,
    storageLimit: 1024 * 1024 * 512,
  },
  {
    id: "user-2",
    email: "anhnv@fpt.edu.vn",
    displayName: "AnhNV",
    password: "User12345",
    role: "user",
    isLocked: false,
    emailVerified: true,
    createdAt: new Date("2026-03-15"),
    loginAttempts: 0,
    lastActive: new Date("2026-05-25"),
    storageUsed: 1024 * 1024 * 120,
    storageLimit: 1024 * 1024 * 512,
  },
  {
    id: "user-3",
    email: "locpd@fpt.edu.vn",
    displayName: "LocPD",
    password: "User12345",
    role: "user",
    isLocked: true,
    emailVerified: true,
    createdAt: new Date("2026-04-01"),
    loginAttempts: 5,
    lastActive: new Date("2026-05-20"),
    storageUsed: 1024 * 1024 * 80,
    storageLimit: 1024 * 1024 * 512,
  },
]

const MOCK_DOCUMENTS: Document[] = [
  {
    id: "doc-1",
    name: "Giải tích 1 - Chương 1.pdf",
    type: "pdf",
    size: "2.4 MB",
    sizeBytes: 2516582,
    uploadedAt: new Date("2026-05-20"),
    uploadedBy: "user-1",
    categoryId: "cat-1",
    status: "ready",
    tags: ["giải tích", "đạo hàm", "tích phân"],
    downloadCount: 15,
    isPublic: true,
    description: "Tài liệu chương 1 môn Giải Tích 1 - Giới hạn và đạo hàm",
    syncedToCloud: true,
  },
  {
    id: "doc-2",
    name: "OOP Java - Slides.pptx",
    type: "pptx",
    size: "5.1 MB",
    sizeBytes: 5348454,
    uploadedAt: new Date("2026-05-22"),
    uploadedBy: "user-1",
    categoryId: "cat-4",
    status: "ready",
    tags: ["java", "lập trình hướng đối tượng", "OOP"],
    downloadCount: 32,
    isPublic: true,
    description: "Slides bài giảng OOP với Java - Kế thừa và Đa hình",
    syncedToCloud: true,
  },
  {
    id: "doc-3",
    name: "Vật lý đại cương - Cơ học.pdf",
    type: "pdf",
    size: "3.8 MB",
    sizeBytes: 3985162,
    uploadedAt: new Date("2026-05-18"),
    uploadedBy: "user-2",
    categoryId: "cat-2",
    status: "ready",
    tags: ["cơ học", "vật lý", "động lực học"],
    downloadCount: 8,
    isPublic: true,
    syncedToCloud: false,
  },
  {
    id: "doc-4",
    name: "English Grammar Advanced.docx",
    type: "docx",
    size: "1.2 MB",
    sizeBytes: 1258291,
    uploadedAt: new Date("2026-05-15"),
    uploadedBy: "user-2",
    categoryId: "cat-6",
    status: "ready",
    tags: ["grammar", "english", "advanced"],
    downloadCount: 24,
    isPublic: true,
    syncedToCloud: false,
  },
  {
    id: "doc-5",
    name: "Kinh tế vi mô - Chương 3.pdf",
    type: "pdf",
    size: "4.5 MB",
    sizeBytes: 4718592,
    uploadedAt: new Date("2026-05-10"),
    uploadedBy: "user-1",
    categoryId: "cat-5",
    status: "ready",
    tags: ["kinh tế", "cung cầu", "thị trường"],
    downloadCount: 11,
    isPublic: true,
    syncedToCloud: true,
  },
]

const MOCK_ACTIVITY: ActivityLog[] = [
  { id: "log-1", userId: "user-1", action: "Tải lên tài liệu", target: "Giải tích 1 - Chương 1.pdf", timestamp: new Date("2026-05-20T09:30:00") },
  { id: "log-2", userId: "user-1", action: "Tải xuống tài liệu", target: "OOP Java - Slides.pptx", timestamp: new Date("2026-05-21T14:00:00") },
  { id: "log-3", userId: "user-1", action: "Chat với AI", target: "Giải tích 1 - Chương 1.pdf", timestamp: new Date("2026-05-22T10:15:00") },
  { id: "log-4", userId: "user-1", action: "Tìm kiếm", target: "giải tích đạo hàm", timestamp: new Date("2026-05-23T08:45:00") },
]

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppState {
  currentUser: User | null
  users: User[]
  documents: Document[]
  categories: Category[]
  chatSessions: ChatSession[]
  activeChatId: string | null
  searchHistory: SearchHistoryItem[]
  activityLogs: ActivityLog[]
  isDarkMode: boolean
  language: Language
  // Auth modal
  showAuthModal: boolean
  authModalTab: "login" | "register" | "forgot"
  // Page
  currentPage: "home" | "documents" | "chat" | "cloud" | "search" | "profile" | "admin" | "trash"
  // Actions
  login: (email: string, password: string) => { success: boolean; error?: string }
  register: (email: string, password: string, displayName: string) => { success: boolean; error?: string }
  logout: () => void
  openAuthModal: (tab?: "login" | "register" | "forgot") => void
  closeAuthModal: () => void
  setCurrentPage: (page: AppState["currentPage"]) => void
  addDocument: (doc: Document) => void
  updateDocument: (id: string, updates: Partial<Document>) => void
  deleteDocument: (id: string) => void
  restoreDocument: (id: string) => void
  permanentlyDeleteDocument: (id: string) => void
  syncDocumentToCloud: (id: string, synced: boolean) => void
  addChatSession: (session: ChatSession) => void
  updateChatSession: (id: string, updates: Partial<ChatSession>) => void
  setActiveChatId: (id: string | null) => void
  addSearchHistory: (query: string) => void
  updateUser: (id: string, updates: Partial<User>) => void
  toggleUserLock: (id: string) => void
  createAdminAccount: (email: string, password: string, displayName: string) => { success: boolean; error?: string }
  addCategory: (name: string, color: string) => void
  deleteCategory: (id: string) => void
  toggleDarkMode: () => void
  setLanguage: (language: Language) => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS)
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(MOCK_ACTIVITY)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [language, setLanguage] = useState<Language>("vi")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<"login" | "register" | "forgot">("login")
  const [currentPage, setCurrentPage] = useState<AppState["currentPage"]>("home")

  const login = useCallback((email: string, password: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!user) return { success: false, error: "Email không tồn tại trong hệ thống." }
    if (user.isLocked) return { success: false, error: "Tài khoản đã bị khóa. Liên hệ Admin." }
    if (password !== user.password) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, loginAttempts: u.loginAttempts + 1 } : u))
      const attempts = user.loginAttempts + 1
      if (attempts >= 5) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isLocked: true } : u))
        return { success: false, error: "Tài khoản bị khóa do đăng nhập sai 5 lần." }
      }
      return { success: false, error: `Sai mật khẩu. Còn ${5 - attempts} lần thử.` }
    }
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, loginAttempts: 0, lastActive: new Date() } : u))
    setCurrentUser({ ...user, loginAttempts: 0, lastActive: new Date() })
    setShowAuthModal(false)
    return { success: true }
  }, [users])

  const register = useCallback((email: string, password: string, displayName: string) => {
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "Email này đã được đăng ký." }
    }
    if (password.length < 8) return { success: false, error: "Mật khẩu phải có ít nhất 8 ký tự." }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { success: false, error: "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số." }
    }
    if (displayName.length > 50) return { success: false, error: "Tên hiển thị không được vượt quá 50 ký tự." }
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      displayName,
      password,
      role: "user",
      isLocked: false,
      emailVerified: false,
      createdAt: new Date(),
      loginAttempts: 0,
      lastActive: new Date(),
      storageUsed: 0,
      storageLimit: 1024 * 1024 * 512,
    }
    setUsers(prev => [...prev, newUser])
    setCurrentUser(newUser)
    setShowAuthModal(false)
    return { success: true }
  }, [users])

  const logout = useCallback(() => {
    setCurrentUser(null)
    setActiveChatId(null)
    setCurrentPage("home")
  }, [])

  const openAuthModal = useCallback((tab: "login" | "register" | "forgot" = "login") => {
    setAuthModalTab(tab)
    setShowAuthModal(true)
  }, [])

  const closeAuthModal = useCallback(() => setShowAuthModal(false), [])

  const addDocument = useCallback((doc: Document) => {
    setDocuments(prev => [doc, ...prev])
    setCurrentUser(user => {
      if (!user) return null
      return { ...user, storageUsed: user.storageUsed + doc.sizeBytes }
    })
  }, [])

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d))
  }, [])

  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, status: "deleted" } : d))
    const doc = documents.find(d => d.id === id)
    if (currentUser?.role === "admin" && doc) {
      setActivityLogs(prev => [{
        id: `log-${Date.now()}`,
        userId: currentUser.id,
        action: "Admin deleted document",
        target: doc.name,
        timestamp: new Date(),
      }, ...prev])
    }
  }, [currentUser, documents])

  const restoreDocument = useCallback((id: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, status: "ready" } : d))
    const doc = documents.find(d => d.id === id)
    if (currentUser?.role === "admin" && doc) {
      setActivityLogs(prev => [{
        id: `log-${Date.now()}`,
        userId: currentUser.id,
        action: "Admin restored document",
        target: doc.name,
        timestamp: new Date(),
      }, ...prev])
    }
  }, [currentUser, documents])

  const permanentlyDeleteDocument = useCallback((id: string) => {
    setDocuments(prev => {
      const doc = prev.find(d => d.id === id)
      if (doc && currentUser && doc.uploadedBy === currentUser.id) {
        setCurrentUser(user => user ? { ...user, storageUsed: Math.max(0, user.storageUsed - doc.sizeBytes) } : null)
      }
      return prev.filter(d => d.id !== id)
    })
  }, [currentUser])

  const syncDocumentToCloud = useCallback((id: string, synced: boolean) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, syncedToCloud: synced } : d))
  }, [])

  const addChatSession = useCallback((session: ChatSession) => {
    setChatSessions(prev => [session, ...prev])
  }, [])

  const updateChatSession = useCallback((id: string, updates: Partial<ChatSession>) => {
    setChatSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }, [])

  const addSearchHistory = useCallback((query: string) => {
    const item: SearchHistoryItem = { id: `search-${Date.now()}`, query, timestamp: new Date() }
    setSearchHistory(prev => [item, ...prev.slice(0, 9)])
  }, [])

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u))
    setCurrentUser(prev => prev?.id === id ? { ...prev, ...updates } : prev)
  }, [])

  const toggleUserLock = useCallback((id: string) => {
    const target = users.find(u => u.id === id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isLocked: !u.isLocked, loginAttempts: !u.isLocked ? 5 : 0 } : u))
    if (currentUser?.role === "admin" && target) {
      setActivityLogs(prev => [{
        id: `log-${Date.now()}`,
        userId: currentUser.id,
        action: target.isLocked ? "Admin unlocked account" : "Admin locked account",
        target: target.email,
        timestamp: new Date(),
      }, ...prev])
    }
  }, [currentUser, users])

  const createAdminAccount = useCallback((email: string, password: string, displayName: string) => {
    if (currentUser?.role !== "admin") return { success: false, error: "Only Admin can create another Admin account." }
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "This email is already registered." }
    }
    if (password.length < 8) return { success: false, error: "Password must be at least 8 characters." }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { success: false, error: "Password must include at least one letter and one number." }
    }
    const admin: User = {
      id: `admin-${Date.now()}`,
      email,
      displayName,
      password,
      role: "admin",
      isLocked: false,
      emailVerified: true,
      createdAt: new Date(),
      loginAttempts: 0,
      lastActive: new Date(),
      storageUsed: 0,
      storageLimit: 1024 * 1024 * 1024 * 5,
    }
    setUsers(prev => [...prev, admin])
    setActivityLogs(prev => [{
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      action: "Admin created Admin account",
      target: email,
      timestamp: new Date(),
    }, ...prev])
    return { success: true }
  }, [currentUser, users])

  const addCategory = useCallback((name: string, color: string) => {
    const cat: Category = { id: `cat-${Date.now()}`, name, color }
    setCategories(prev => [...prev, cat])
    if (currentUser?.role === "admin") {
      setActivityLogs(prev => [{
        id: `log-${Date.now()}`,
        userId: currentUser.id,
        action: "Admin added category",
        target: name,
        timestamp: new Date(),
      }, ...prev])
    }
  }, [currentUser])

  const deleteCategory = useCallback((id: string) => {
    const cat = categories.find(c => c.id === id)
    setCategories(prev => prev.filter(c => c.id !== id))
    if (currentUser?.role === "admin" && cat) {
      setActivityLogs(prev => [{
        id: `log-${Date.now()}`,
        userId: currentUser.id,
        action: "Admin deleted category",
        target: cat.name,
        timestamp: new Date(),
      }, ...prev])
    }
  }, [categories, currentUser])

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const next = !prev
      document.documentElement.classList.toggle("dark", next)
      return next
    })
  }, [])

  return (
    <AppContext.Provider value={{
      currentUser, users, documents, categories, chatSessions, activeChatId,
      searchHistory, activityLogs, isDarkMode, language, showAuthModal, authModalTab, currentPage,
      login, register, logout, openAuthModal, closeAuthModal, setCurrentPage,
      addDocument, updateDocument, deleteDocument, restoreDocument, permanentlyDeleteDocument, syncDocumentToCloud,
      addChatSession, updateChatSession, setActiveChatId, addSearchHistory,
      updateUser, toggleUserLock, createAdminAccount, addCategory, deleteCategory, toggleDarkMode,
      setLanguage,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB"
}

export function getAIMockResponse(question: string, docName?: string): string {
  const q = question.toLowerCase()
  if (q.includes("tóm tắt") || q.includes("summary")) {
    return `📝 **Tóm tắt ${docName ? `"${docName}"` : "tài liệu"}:**\n\nTài liệu này bao gồm các nội dung chính:\n\n1. **Phần mở đầu** — Giới thiệu tổng quan về chủ đề, định nghĩa các khái niệm cơ bản.\n2. **Nội dung chính** — Phân tích chi tiết với các ví dụ minh họa thực tế.\n3. **Ứng dụng** — Cách áp dụng kiến thức vào bài tập và thực tiễn.\n4. **Kết luận** — Tổng hợp điểm mấu chốt và gợi ý học tập tiếp theo.\n\nBạn muốn tôi giải thích sâu hơn phần nào?`
  }
  if (q.includes("flashcard") || q.includes("thẻ học")) {
    return `🃏 **Flashcard từ tài liệu:**\n\n**Thẻ 1:**\n- Câu hỏi: Định nghĩa khái niệm trung tâm là gì?\n- Đáp án: Là nền tảng lý thuyết cốt lõi của chủ đề.\n\n**Thẻ 2:**\n- Câu hỏi: Kể tên 3 ứng dụng thực tế.\n- Đáp án: (1) Bài tập tính toán, (2) Phân tích trường hợp, (3) Thiết kế mô hình.\n\n**Thẻ 3:**\n- Câu hỏi: Công thức/quy tắc quan trọng nhất?\n- Đáp án: Xem lại trang 15-20 của tài liệu.\n\nTôi có thể tạo thêm flashcard theo yêu cầu cụ thể!`
  }
  if (q.includes("định nghĩa") || q.includes("là gì") || q.includes("what is")) {
    return `💡 **Giải thích khái niệm:**\n\nDựa trên ${docName ? `tài liệu "${docName}"` : "nội dung bạn cung cấp"}, đây là định nghĩa chi tiết:\n\nKhái niệm này được hiểu là **tập hợp các nguyên tắc và phương pháp** được áp dụng trong lĩnh vực này. Nó bao gồm:\n\n• **Khía cạnh lý thuyết**: Nền tảng học thuật và nghiên cứu khoa học\n• **Khía cạnh thực hành**: Ứng dụng trong các tình huống thực tế\n• **Mối liên hệ**: Kết nối với các chủ đề liên quan khác\n\nBạn cần ví dụ cụ thể hơn không?`
  }
  return `🤖 **Phân tích câu hỏi của bạn:**\n\n"${question.slice(0, 60)}${question.length > 60 ? "..." : ""}"\n\nDựa trên ${docName ? `tài liệu **"${docName}"**` : "hệ thống kiến thức"}:\n\nĐây là một câu hỏi thú vị liên quan đến chủ đề này. Từ góc độ học thuật:\n\n1. **Phân tích vấn đề**: Cần xem xét các yếu tố ảnh hưởng\n2. **Hướng tiếp cận**: Có thể áp dụng phương pháp từ bước đơn giản đến phức tạp\n3. **Kết quả mong đợi**: Hiểu rõ vấn đề và có thể áp dụng thực tế\n\n💡 *Tip: Upload tài liệu cụ thể để tôi trả lời chính xác hơn!*`
}
