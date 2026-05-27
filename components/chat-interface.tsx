"use client"

import { useState, useRef, useEffect } from "react"
import {
  Send, Sparkles, User, Copy, ThumbsUp, ThumbsDown,
  RotateCcw, FileText, Plus, Clock, ChevronDown, AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useApp, getAIMockResponse, ChatSession, ChatMessage } from "@/lib/store"

const MAX_QUESTION_LENGTH = 500

export function EnhancedChatInterface() {
  const {
    currentUser, documents, chatSessions, activeChatId,
    addChatSession, updateChatSession, setActiveChatId,
    openAuthModal,
  } = useApp()

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [showDocPicker, setShowDocPicker] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const activeSession = chatSessions.find(s => s.id === activeChatId) ?? null
  const messages = activeSession?.messages ?? []
  const availableDocs = documents.filter(d => d.status === "ready")
  const selectedDoc = availableDocs.find(d => d.id === selectedDocId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleSend = async (content: string) => {
    if (!content.trim() || isLoading) return
    if (!currentUser) { openAuthModal("login"); return }
    if (content.length > MAX_QUESTION_LENGTH) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    let sessionId = activeChatId

    if (!sessionId) {
      const newSession: ChatSession = {
        id: `chat-${Date.now()}`,
        title: content.slice(0, 40) + (content.length > 40 ? "..." : ""),
        messages: [userMsg],
        documentId: selectedDocId ?? undefined,
        createdAt: new Date(),
      }
      addChatSession(newSession)
      setActiveChatId(newSession.id)
      sessionId = newSession.id
    } else {
      updateChatSession(sessionId, { messages: [...messages, userMsg] })
    }

    setInput("")
    setIsLoading(true)

    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800))

    const aiMsg: ChatMessage = {
      id: `msg-${Date.now()}-ai`,
      role: "assistant",
      content: getAIMockResponse(content, selectedDoc?.name),
      timestamp: new Date(),
    }

    const currentSession = chatSessions.find(s => s.id === sessionId)
    const updatedMessages = [...(currentSession?.messages ?? [userMsg]), aiMsg]
    updateChatSession(sessionId!, { messages: updatedMessages })
    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend(input)
    }
  }

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleNewChat = () => {
    setActiveChatId(null)
    setInput("")
  }

  const suggestedQuestions = [
    "Tóm tắt nội dung chính của tài liệu này",
    "Tóm tắt định nghĩa & ví dụ",
    "Các khái niệm quan trọng nhất là gì?",
    "Giải thích chi tiết phần khó nhất",
  ]

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="flex h-full flex-col">
      {/* Chat Toolbar */}
      <div className="flex items-center gap-2 border-b border-border bg-background px-4 py-2">
        <Button
          id="new-chat-btn-chat"
          variant="outline"
          size="sm"
          onClick={handleNewChat}
          className="gap-1.5"
        >
          <Plus className="h-3 w-3" />
          Chat mới
        </Button>

        {/* Document Selector */}
        <div className="relative">
          <Button
            id="doc-picker-btn"
            variant="outline"
            size="sm"
            onClick={() => setShowDocPicker(!showDocPicker)}
            className={cn("gap-1.5", selectedDoc && "border-primary/50 bg-primary/5 text-primary")}
          >
            <FileText className="h-3 w-3" />
            {selectedDoc ? selectedDoc.name.slice(0, 20) + "..." : "Chọn tài liệu"}
            <ChevronDown className="h-3 w-3" />
          </Button>
          {showDocPicker && (
            <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-xl border border-border bg-card shadow-xl">
              <div className="max-h-48 overflow-y-auto p-1">
                <button
                  onClick={() => { setSelectedDocId(null); setShowDocPicker(false) }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  Không chọn tài liệu
                </button>
                {availableDocs.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => { setSelectedDocId(doc.id); setShowDocPicker(false) }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted",
                      selectedDocId === doc.id ? "bg-primary/10 text-primary" : "text-foreground"
                    )}
                  >
                    <FileText className="h-3 w-3 shrink-0" />
                    <span className="truncate">{doc.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedDoc && (
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
            <FileText className="h-3 w-3" />
            Đang chat về: {selectedDoc.name.slice(0, 25)}
          </span>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4" onClick={() => setShowDocPicker(false)}>
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              {selectedDoc ? `Chat về "${selectedDoc.name.slice(0, 30)}"` : "Bắt đầu cuộc trò chuyện"}
            </h3>
            <p className="mb-8 max-w-md text-center text-sm text-muted-foreground">
              {currentUser
                ? "Hỏi bất kỳ điều gì — AI sẽ trả lời dựa trên tài liệu bạn chọn."
                : "Đăng nhập để lưu lịch sử chat và sử dụng đầy đủ tính năng AI."}
            </p>
            {/* Suggested questions */}
            <div className="grid w-full max-w-xl gap-2 sm:grid-cols-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="rounded-xl border border-border bg-card p-3 text-left text-sm text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70">
                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div className={cn("max-w-[80%]")}>
                  <div className={cn(
                    "rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <div className={cn(
                    "mt-1 flex items-center gap-1",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}>
                    <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                    {message.role === "assistant" && (
                      <>
                        <Button
                          variant="ghost" size="icon" className="h-5 w-5"
                          onClick={() => handleCopy(message.id, message.content)}
                          title="Sao chép"
                        >
                          <Copy className={cn("h-3 w-3", copiedId === message.id ? "text-green-500" : "")} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5" title="Hữu ích">
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5" title="Không hữu ích">
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {message.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70">
                  <Sparkles className="h-4 w-4 animate-pulse text-primary-foreground" />
                </div>
                <div className="rounded-2xl bg-muted px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background p-4">
        {!currentUser && (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-yellow-500/10 px-3 py-2 text-sm text-yellow-600 dark:text-yellow-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              <button onClick={() => openAuthModal("login")} className="font-medium underline">Đăng nhập</button>
              {" "}để lưu lịch sử chat (BR-63)
            </span>
          </div>
        )}
        <form
          onSubmit={e => { e.preventDefault(); handleSend(input) }}
          className="mx-auto max-w-3xl"
        >
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentUser ? "Nhập câu hỏi của bạn... (Enter để gửi)" : "Đăng nhập để sử dụng AI Chatbot"}
              rows={1}
              maxLength={MAX_QUESTION_LENGTH}
              disabled={!currentUser}
              className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
            />
            <div className="flex flex-col items-end gap-1">
              {input.length > MAX_QUESTION_LENGTH * 0.8 && (
                <span className={cn("text-xs", input.length >= MAX_QUESTION_LENGTH ? "text-destructive" : "text-muted-foreground")}>
                  {input.length}/{MAX_QUESTION_LENGTH}
                </span>
              )}
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading || !currentUser || input.length > MAX_QUESTION_LENGTH}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            AI có thể mắc lỗi. Hãy kiểm tra lại thông tin quan trọng.
          </p>
        </form>
      </div>
    </div>
  )
}
