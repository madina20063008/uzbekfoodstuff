import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card"
import { Alert, AlertDescription } from "../../ui/alert"
import { Loader2, Mail, Lock } from "lucide-react"
import { useAuth } from "../../../contexts/auth-context"
import logo from "../../../../public/logo.png"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Basic validation
    if (!email || !email.includes("@") || !email.includes(".")) {
      setError("Iltimos, to'g'ri email manzilini kiriting")
      setIsLoading(false)
      return
    }

    if (!password) {
      setError("Iltimos, parolni kiriting")
      setIsLoading(false)
      return
    }

    try {
      const success = await login(email, password)

      if (success) {
        navigate("/admin")
      } else {
        setError("Email yoki parol noto'g'ri")
      }
    } catch (error: any) {
      setError(error.message || "Tizimga kirishda xatolik. Iltimos, qaytadan urinib ko'ring")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-transparent rounded-2xl flex items-center justify-center">
            <img src={logo} alt="logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Uzbek Foodstuff</h1>
            <p className="text-gray-600 mt-2">Kontentingizni boshqarish uchun tizimga kiring</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center">Xush kelibsiz</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Uzbek Foodstuff tizimiga kirish uchun ma'lumotlaringizni kiriting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="animate-fade-in">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Parol
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Parolingizni kiriting"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Tizimga kirilmoqda...
                  </>
                ) : (
                  "Kirish"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 Uzbek Foodstuff. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </div>
  )
}