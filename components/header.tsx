"use client"

import { Moon, Sun, Sparkles, ChevronDown, LogOut, User, Settings, LayoutDashboard, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"

interface HeaderProps {
  onLogin?: () => void
  onRegister?: () => void
}

export function Header({ onLogin, onRegister }: HeaderProps) {
  const { currentUser, logout, openAuthModal, setCurrentPage, toggleDarkMode, isDarkMode } = useApp()

  const avatarInitials = currentUser?.displayName
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 sticky top-0 z-20">
      {/* Description Text */}
      <div className="hidden text-sm text-muted-foreground md:block">
        Hệ thống quản lý tài liệu học tập AI
      </div>

      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <Button
          id="dark-mode-toggle"
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="text-muted-foreground hover:text-foreground"
          title={isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              VI
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Tiếng Việt</DropdownMenuItem>
            <DropdownMenuItem>English</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {currentUser ? (
          <>
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            </Button>

            {/* Upgrade (for regular users) */}
            {currentUser.role === "user" && (
              <Button variant="outline" size="sm" className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5">
                <Sparkles className="h-4 w-4" />
                Nâng cấp
              </Button>
            )}

            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  id="user-menu"
                  className="flex items-center gap-2 rounded-full border border-border bg-muted px-2 py-1 text-sm transition-colors hover:bg-accent"
                >
                  <div className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                    currentUser.role === "admin"
                      ? "bg-orange-500 text-white"
                      : "bg-primary text-primary-foreground"
                  )}>
                    {avatarInitials}
                  </div>
                  <span className="hidden max-w-[120px] truncate font-medium text-foreground sm:block">
                    {currentUser.displayName}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{currentUser.displayName}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                  <span className={cn(
                    "mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                    currentUser.role === "admin"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-primary/10 text-primary"
                  )}>
                    {currentUser.role === "admin" ? "Admin" : "User"}
                  </span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem id="go-profile" onClick={() => setCurrentPage("profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Hồ sơ cá nhân
                </DropdownMenuItem>
                {currentUser.role === "admin" && (
                  <DropdownMenuItem id="go-admin" onClick={() => setCurrentPage("admin")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setCurrentPage("home")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Cài đặt
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem id="logout-btn" onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            {/* Upgrade Button */}
            <Button variant="outline" size="sm" className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5">
              <Sparkles className="h-4 w-4" />
              Nâng cấp
            </Button>

            {/* Login Button */}
            <Button
              id="login-btn"
              variant="ghost"
              size="sm"
              onClick={() => openAuthModal("login")}
            >
              Đăng nhập
            </Button>

            {/* Register Button */}
            <Button
              id="register-btn"
              size="sm"
              onClick={() => openAuthModal("register")}
            >
              Đăng ký
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
