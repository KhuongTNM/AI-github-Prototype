"use client"

import { Upload, Cloud, Bot, Shield, FileText } from "lucide-react"

const features = [
  {
    icon: Upload,
    title: "Quản lý tài liệu",
    description: "Upload, phân loại theo môn, tìm kiếm và chia sẻ tài liệu dễ dàng.",
  },
  {
    icon: Cloud,
    title: "Lưu trữ Cloud",
    description: "Truy cập tài liệu mọi lúc, mọi nơi. Không lo đầy ổ cứng cá nhân.",
  },
  {
    icon: Bot,
    title: "AI Chatbot",
    description: "Hỏi đáp trực tiếp với nội dung tài liệu của bạn bằng AI.",
  },
  {
    icon: Shield,
    title: "An toàn & Riêng tư",
    description: "Tài khoản bảo mật, dữ liệu mã hóa, chỉ bạn mới truy cập được.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-12">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
          Mọi thứ bạn cần để học hiệu quả
        </h2>
        <p className="text-muted-foreground">
          Bốn chức năng cốt lõi của AI Study Hub
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100">
              <feature.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-border py-6 text-center">
      <p className="text-sm text-muted-foreground">
        {"© 2026 AI Study Hub • SU26SWP10 • Dành cho sinh viên"}
      </p>
    </footer>
  )
}
