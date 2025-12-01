import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/auth-context"
import { AdminSidebar } from "./admin-sidebar"
import { Globe, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, loading } = useAuth()
  const [selectedLang, setSelectedLang] = useState<"en" | "uz" | "ru">("ru")
  const navigate = useNavigate()

  useEffect(() => {
    const lang = (localStorage.getItem("lang") as "en" | "uz" | "ru") || "ru"
    setSelectedLang(lang)
  }, [])

  function changeLanguage(lang: "en" | "uz" | "ru") {
    localStorage.setItem("lang", lang)
    window.location.reload()
  }

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login")
    }
  }, [isAuthenticated, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-white border-gray-200">
      <AdminSidebar />
      <div className="lg:pl-64">
        <main className="p-4 lg:p-8">
          <div className="flex justify-end items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <Select value={selectedLang} onValueChange={(value: "en" | "uz" | "ru") => changeLanguage(value)}>
              <SelectTrigger className="w-[120px] bg-white border-gray-200">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="uz">Uzbek</SelectItem>
                <SelectItem value="ru">Russian</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  )
}