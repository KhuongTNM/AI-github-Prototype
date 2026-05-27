"use client"

import { useState } from "react"
import { X, Eye, EyeOff, Loader2, GraduationCap, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"

export function AuthModal() {
  const { showAuthModal, authModalTab, closeAuthModal, openAuthModal, login, register } = useApp()
  const [tab, setTab] = useState<"login" | "register" | "forgot">(authModalTab)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  if (!showAuthModal) return null

  const switchTab = (t: typeof tab) => {
    setTab(t)
    setError("")
    setSuccess("")
    setEmail("")
    setPassword("")
    setDisplayName("")
    setConfirmPassword("")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !password) { setError("Vui lòng điền đầy đủ thông tin."); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    const result = login(email, password)
    setLoading(false)
    if (!result.success) setError(result.error || "Đăng nhập thất bại.")
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !password || !displayName) { setError("Vui lòng điền đầy đủ thông tin."); return }
    if (password !== confirmPassword) { setError("Mật khẩu xác nhận không khớp."); return }
    if (password.length < 8) { setError("Mật khẩu phải có ít nhất 8 ký tự."); return }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số."); return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    const result = register(email, password, displayName)
    setLoading(false)
    if (!result.success) setError(result.error || "Đăng ký thất bại.")
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email) { setError("Vui lòng nhập email."); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    setSuccess("Link đặt lại mật khẩu đã được gửi đến email của bạn!")
  }

  // Password strength
  const strength = (() => {
    if (!password || tab !== "register") return 0
    let s = 0
    if (password.length >= 8) s++
    if (/[A-Z]/.test(password)) s++
    if (/[0-9]/.test(password)) s++
    if (/[^a-zA-Z0-9]/.test(password)) s++
    return s
  })()

  const strengthLabel = ["", "Yếu", "Trung bình", "Tốt", "Mạnh"][strength]
  const strengthColor = ["", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"][strength]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeAuthModal} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">AI Study Hub</span>
          </div>
          <Button variant="ghost" size="icon" onClick={closeAuthModal}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        {tab !== "forgot" && (
          <div className="flex border-b border-border">
            {(["login", "register"] as const).map(t => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={cn(
                  "flex-1 py-3 text-sm font-medium transition-colors",
                  tab === t
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>
            ))}
          </div>
        )}

        <div className="p-6">
          {/* Error/Success */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          {/* LOGIN */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Mật khẩu</label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button type="button" onClick={() => switchTab("forgot")} className="mt-1 text-xs text-primary hover:underline">
                  Quên mật khẩu?
                </button>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Đăng nhập
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                💡 <strong>Demo:</strong> Dùng email bất kỳ trong hệ thống với bất kỳ mật khẩu.
              </p>
            </form>
          )}

          {/* REGISTER */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Tên hiển thị</label>
                <input
                  id="reg-name"
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  maxLength={50}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
                <p className="mt-0.5 text-right text-xs text-muted-foreground">{displayName.length}/50</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Mật khẩu</label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự, có chữ và số"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={cn("h-1 flex-1 rounded-full", i <= strength ? strengthColor : "bg-muted")} />
                      ))}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">Độ mạnh: <span className="font-medium">{strengthLabel}</span></p>
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Xác nhận mật khẩu</label>
                <input
                  id="reg-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    "w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50",
                    confirmPassword && confirmPassword !== password ? "border-destructive" : "border-border"
                  )}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Tạo tài khoản
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Đã có tài khoản?{" "}
                <button type="button" onClick={() => switchTab("login")} className="text-primary hover:underline">Đăng nhập</button>
              </p>
            </form>
          )}

          {/* FORGOT PASSWORD */}
          {tab === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="mb-2 text-center">
                <h3 className="text-lg font-semibold text-foreground">Quên mật khẩu?</h3>
                <p className="mt-1 text-sm text-muted-foreground">Nhập email để nhận link đặt lại mật khẩu.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                  disabled={!!success}
                />
              </div>
              {!success && (
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Gửi link đặt lại
                </Button>
              )}
              <button type="button" onClick={() => switchTab("login")} className="w-full text-center text-sm text-primary hover:underline">
                ← Quay lại đăng nhập
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
