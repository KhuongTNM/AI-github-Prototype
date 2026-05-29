"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"

// ─── Types ──────────────────────────────────────────────────────────────────

export type UserRole = "guest" | "user" | "sub-admin" | "admin"

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
  storageUsed: number
  storageLimit: number
}

export interface Category {
  id: string
  name: string
  color: string
}

export type DocStatus = "uploading" | "scanning" | "ready" | "failed" | "deleted"
export type ShareStatus = "none" | "pending" | "approved" | "rejected"

export interface Document {
  id: string
  name: string
  type: "pdf" | "docx" | "pptx"
  size: string
  sizeBytes: number
  uploadedAt: Date
  uploadedBy: string
  categoryId: string
  subject: string
  status: DocStatus
  uploadProgress?: number
  description?: string
  tags: string[]
  downloadCount: number
  isPublic: boolean
  shareStatus: ShareStatus
  shareNote?: string
  reviewedBy?: string
  reviewedAt?: Date
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

const MOCK_SUB_ADMIN: User = {
  id: "user-sub-admin",
  email: "subadmin@aistudyhub.com",
  displayName: "Sub Admin",
  password: "SubAdmin123",
  role: "sub-admin",
  isLocked: false,
  emailVerified: true,
  createdAt: new Date("2026-02-01"),
  loginAttempts: 0,
  lastActive: new Date(),
  storageUsed: 1024 * 1024 * 10,
  storageLimit: 1024 * 1024 * 1024,
}

const MOCK_USERS: User[] = [
  MOCK_ADMIN,
  MOCK_SUB_ADMIN,
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
    subject: "Giải tích",
    status: "ready",
    tags: ["giải tích", "đạo hàm", "tích phân"],
    downloadCount: 15,
    isPublic: true,
    shareStatus: "approved",
    description: "Tài liệu chương 1 môn Giải Tích 1 - Giới hạn và đạo hàm",
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
    subject: "Lập trình",
    status: "ready",
    tags: ["java", "OOP"],
    downloadCount: 32,
    isPublic: true,
    shareStatus: "approved",
    description: "Slides bài giảng OOP với Java",
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
    subject: "Vật lý",
    status: "ready",
    tags: ["cơ học", "vật lý"],
    downloadCount: 8,
    isPublic: true,
    shareStatus: "approved",
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
    subject: "Tiếng Anh",
    status: "ready",
    tags: ["grammar", "english"],
    downloadCount: 24,
    isPublic: true,
    shareStatus: "approved",
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
    subject: "Kinh tế",
    status: "ready",
    tags: ["kinh tế", "cung cầu"],
    downloadCount: 11,
    isPublic: false,
    shareStatus: "pending",
    shareNote: "Muốn chia sẻ cho cả lớp tham khảo",
  },
  {
    id: "doc-6",
    name: "Hóa hữu cơ - Tổng hợp.pdf",
    type: "pdf",
    size: "3.1 MB",
    sizeBytes: 3251200,
    uploadedAt: new Date("2026-05-25"),
    uploadedBy: "user-2",
    categoryId: "cat-3",
    subject: "Hóa học",
    status: "ready",
    tags: ["hóa hữu cơ", "tổng hợp"],
    downloadCount: 0,
    isPublic: false,
    shareStatus: "pending",
    shareNote: "Tài liệu ôn tập hóa hữu cơ",
  },
]

const MOCK_ACTIVITY: ActivityLog[] = [
  { id: "log-1", userId: "user-1", action: "Tải lên tài liệu", target: "Giải tích 1 - Chương 1.pdf", timestamp: new Date("2026-05-20T09:30:00") },
  { id: "log-2", userId: "user-1", action: "Tải xuống tài liệu", target: "OOP Java - Slides.pptx", timestamp: new Date("2026-05-21T14:00:00") },
  { id: "log-3", userId: "user-sub-admin", action: "Updated storage limit", target: "student@aistudyhub.com", timestamp: new Date("2026-05-22T10:15:00") },
]

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppState {
  currentUser: User | null
  users: User[]
  documents: Document[]
  categories: Category[]
  chatSessions: ChatSession[]
  activeChatId: string | null
  activityLogs: ActivityLog[]
  isDarkMode: boolean
  language: Language
  showAuthModal: boolean
  authModalTab: "login" | "register" | "forgot"
  currentPage: "home" | "documents" | "chat" | "cloud" | "profile" | "admin" | "trash"
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
  addChatSession: (session: ChatSession) => void
  updateChatSession: (id: string, updates: Partial<ChatSession>) => void
  setActiveChatId: (id: string | null) => void
  updateUser: (id: string, updates: Partial<User>) => void
  toggleUserLock: (id: string) => { success: boolean; error?: string }
  resetUserPassword: (id: string, password: string) => { success: boolean; error?: string }
  deleteUserAccount: (id: string) => { success: boolean; error?: string }
  createSubAdminAccount: (email: string, password: string, displayName: string) => { success: boolean; error?: string }
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
      return { success: false, error: "Sai mật khẩu." }
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
      email, displayName, password,
      role: "user", isLocked: false, emailVerified: false,
      createdAt: new Date(), loginAttempts: 0, lastActive: new Date(),
      storageUsed: 0, storageLimit: 1024 * 1024 * 512,
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
  }, [])

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d))
  }, [])

  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, status: "deleted" } : d))
  }, [])

  const restoreDocument = useCallback((id: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, status: "ready" } : d))
  }, [])

  const addChatSession = useCallback((session: ChatSession) => {
    setChatSessions(prev => [session, ...prev])
  }, [])

  const updateChatSession = useCallback((id: string, updates: Partial<ChatSession>) => {
    setChatSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }, [])

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u))
    setCurrentUser(prev => prev?.id === id ? { ...prev, ...updates } : prev)
  }, [])

  const toggleUserLock = useCallback((id: string) => {
    const target = users.find(u => u.id === id)
    if (!currentUser || !target) return { success: false, error: "Không tìm thấy tài khoản." }
    if (!["admin", "sub-admin"].includes(currentUser.role)) return { success: false, error: "Không có quyền." }
    if (currentUser.role === "sub-admin" && target.role === "admin") {
      return { success: false, error: "Sub-admin không được khóa tài khoản Admin." }
    }
    if (target.id === currentUser.id) return { success: false, error: "Không thể tự khóa tài khoản hiện tại." }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isLocked: !u.isLocked, loginAttempts: 0 } : u))
    setActivityLogs(prev => [{
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      action: target.isLocked ? "Unlocked account" : "Locked account",
      target: target.email,
      timestamp: new Date(),
    }, ...prev])
    return { success: true }
  }, [currentUser, users])

  const resetUserPassword = useCallback((id: string, password: string) => {
    const target = users.find(u => u.id === id)
    if (!currentUser || !target) return { success: false, error: "Không tìm thấy tài khoản." }
    if (!["admin", "sub-admin"].includes(currentUser.role)) return { success: false, error: "Không có quyền." }
    if (currentUser.role === "sub-admin" && target.role === "admin") {
      return { success: false, error: "Sub-admin không được reset mật khẩu Admin." }
    }
    if (password.length < 8) return { success: false, error: "Mật khẩu phải có ít nhất 8 ký tự." }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, password, loginAttempts: 0 } : u))
    return { success: true }
  }, [currentUser, users])

  const deleteUserAccount = useCallback((id: string) => {
    const target = users.find(u => u.id === id)
    if (!currentUser || !target) return { success: false, error: "Không tìm thấy tài khoản." }
    if (!["admin", "sub-admin"].includes(currentUser.role)) return { success: false, error: "Không có quyền." }
    if (currentUser.role === "sub-admin" && target.role === "admin") {
      return { success: false, error: "Sub-admin không được xóa tài khoản Admin." }
    }
    if (target.id === currentUser.id) return { success: false, error: "Không thể tự xóa tài khoản hiện tại." }
    setUsers(prev => prev.filter(u => u.id !== id))
    setDocuments(prev => prev.map(d => d.uploadedBy === id ? { ...d, status: "deleted" } : d))
    return { success: true }
  }, [currentUser, users])

  const createSubAdminAccount = useCallback((email: string, password: string, displayName: string) => {
    if (currentUser?.role !== "admin") return { success: false, error: "Chỉ Admin mới có thể tạo tài khoản sub-admin." }
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "Email này đã được đăng ký." }
    }
    if (password.length < 8) return { success: false, error: "Mật khẩu phải có ít nhất 8 ký tự." }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { success: false, error: "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số." }
    }
    const subAdmin: User = {
      id: `sub-admin-${Date.now()}`,
      email, displayName, password,
      role: "sub-admin", isLocked: false, emailVerified: true,
      createdAt: new Date(), loginAttempts: 0, lastActive: new Date(),
      storageUsed: 0, storageLimit: 1024 * 1024 * 1024,
    }
    setUsers(prev => [...prev, subAdmin])
    setActivityLogs(prev => [{
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      action: "Admin tạo tài khoản sub-admin",
      target: email,
      timestamp: new Date(),
    }, ...prev])
    return { success: true }
  }, [currentUser, users])

  const addCategory = useCallback((name: string, color: string) => {
    const cat: Category = { id: `cat-${Date.now()}`, name, color }
    setCategories(prev => [...prev, cat])
  }, [])

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id))
  }, [])

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
      activityLogs, isDarkMode, language, showAuthModal, authModalTab, currentPage,
      login, register, logout, openAuthModal, closeAuthModal, setCurrentPage,
      addDocument, updateDocument, deleteDocument, restoreDocument,
      addChatSession, updateChatSession, setActiveChatId,
      updateUser, toggleUserLock, resetUserPassword, deleteUserAccount, createSubAdminAccount, addCategory, deleteCategory,
      toggleDarkMode, setLanguage,
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

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB"
}

export function getAIMockResponse(question: string, docName?: string): string {
  const q = question.toLowerCase()
  if (q.includes("tóm tắt") || q.includes("summary")) {
    return `📝 **Tóm tắt ${docName ? `"${docName}"` : "tài liệu"}:**\n\nTài liệu này bao gồm các nội dung chính:\n\n1. **Phần mở đầu** — Giới thiệu tổng quan về chủ đề.\n2. **Nội dung chính** — Phân tích chi tiết với ví dụ minh họa.\n3. **Ứng dụng** — Cách áp dụng kiến thức vào thực tiễn.\n4. **Kết luận** — Tổng hợp điểm mấu chốt.\n\nBạn muốn tôi giải thích sâu hơn phần nào?`
  }
  return `🤖 **Phân tích câu hỏi của bạn:**\n\n"${question.slice(0, 60)}${question.length > 60 ? "..." : ""}"\n\nDựa trên ${docName ? `tài liệu **"${docName}"**` : "hệ thống kiến thức"}:\n\n1. **Phân tích vấn đề**: Cần xem xét các yếu tố ảnh hưởng\n2. **Hướng tiếp cận**: Áp dụng phương pháp từ đơn giản đến phức tạp\n3. **Kết quả mong đợi**: Hiểu rõ vấn đề và áp dụng thực tế\n\n💡 *Tip: Upload tài liệu cụ thể để tôi trả lời chính xác hơn!*`
}
