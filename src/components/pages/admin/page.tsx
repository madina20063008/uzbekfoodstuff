"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card"
import { apiFetch } from "../../../lib/api"
import { ImageIcon, MessageSquare, Newspaper, Phone, Share2, User, Grid, ShoppingBag, ShoppingCart } from "lucide-react"
import { useTranslation } from "react-i18next"

interface Stats {
  users: number
  orders: number
  categories: number
  products: number
  banners: number
  messages: number
  news: number
  contact_info: number
  social_media: number
}

export default function AdminDashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<Stats>({
    users: 0,
    orders: 0,
    categories: 0,
    products: 0,
    banners: 0,
    messages: 0,
    news: 0,
    contact_info: 0,
    social_media: 0,
  })

  const fetchStats = async () => {
  try {
    const token = localStorage.getItem("access_token")
    const endpoints: { [K in keyof Stats]: string } = {
      users: "/user/",
      orders: "/order/all/",
      categories: "/product/categories/",
      products: "/product/all/",
      banners: "/about/banners/",
      messages: "/about/contact/",
      news: "/about/news/",
      contact_info: "/about/our-contact/",
      social_media: "/about/social-media/",
    }

    const fetchPromises = Object.entries(endpoints).map(async ([key, url]) => {
      try {
        const res = await apiFetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        })
        if (!res.ok) throw new Error(`Failed to fetch ${url}`)
        const data = await res.json()
        return [key, Array.isArray(data) ? data.length : 0] as [keyof Stats, number]
      } catch (err) {
        console.error(err)
        return [key as keyof Stats, 0] as [keyof Stats, number]
      }
    })

    const results = await Promise.all(fetchPromises)
    const newStats = Object.fromEntries(results) as unknown as Stats
    setStats(newStats)
  } catch (err) {
    console.error("Failed to fetch stats:", err)
  }
}


  useEffect(() => {
    fetchStats()
  }, [])

  const statsArray = [
    { name: t("dashboard.stats.users"), value: stats.users, icon: User, description: t("dashboard.stats.users_desc") },
    { name: t("dashboard.stats.orders"), value: stats.orders, icon: ShoppingCart, description: t("dashboard.stats.orders_desc") },
    { name: t("dashboard.stats.categories"), value: stats.categories, icon: Grid, description: t("dashboard.stats.categories_desc") },
    { name: t("dashboard.stats.products"), value: stats.products, icon: ShoppingBag, description: t("dashboard.stats.products_desc") },
    { name: t("dashboard.stats.banners"), value: stats.banners, icon: ImageIcon, description: t("dashboard.stats.banners_desc") },
    { name: t("dashboard.stats.messages"), value: stats.messages, icon: MessageSquare, description: t("dashboard.stats.messages_desc") },
    { name: t("dashboard.stats.news"), value: stats.news, icon: Newspaper, description: t("dashboard.stats.news_desc") },
    { name: t("dashboard.stats.contact_info"), value: stats.contact_info, icon: Phone, description: t("dashboard.stats.contact_info_desc") },
    { name: t("dashboard.stats.social_media"), value: stats.social_media, icon: Share2, description: t("dashboard.stats.social_media_desc") },
  ]

  return (
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-slide-in">
          <h1 className="text-3xl font-bold text-foreground">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("dashboard.subtitle")}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {statsArray.map((stat, index) => (
            <Card
              key={stat.name}
              className="animate-slide-in hover:shadow-lg transition-all bg-gray-100 duration-200 hover:scale-105"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">{stat.name}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="animate-slide-in" style={{ animationDelay: "0.6s" }}>
          <CardHeader>
            <CardTitle>{t("dashboard.quick_actions.title")}</CardTitle>
            <CardDescription>{t("dashboard.quick_actions.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                <ImageIcon className="h-5 w-5" />
                <span className="font-medium">{t("dashboard.quick_actions.add_banner")}</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                <Newspaper className="h-5 w-5" />
                <span className="font-medium">{t("dashboard.quick_actions.create_news")}</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                <MessageSquare className="h-5 w-5" />
                <span className="font-medium">{t("dashboard.quick_actions.view_messages")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

  )
}


export const dynamic = 'force-dynamic'