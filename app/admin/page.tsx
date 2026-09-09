"use client"

import {
  BarChart3,
  FileText,
  LogOut,
  Shield,
  Star,
  Store,
  Users,
} from "lucide-react"

import { BusinessesTab } from "@/components/admin/businesses-tab"
import { Button } from "@/components/ui/button"
import { CategoriesTab } from "@/components/admin/categories-tab"
import { OverviewTab } from "@/components/admin/overview-tab"
import { ReviewsTab } from "@/components/admin/reviews-tab"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { UsersTab } from "@/components/admin/users-tab"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { useState } from "react"

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "businesses", label: "Businesses", icon: Store },
  { id: "categories", label: "Categories", icon: FileText },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "users", label: "Users", icon: Users },
] as const

type TabId = (typeof tabs)[number]["id"]

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>("overview")

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              <h1 className="font-heading text-3xl font-bold tracking-tight">
                Admin Panel
              </h1>
            </div>
            <p className="mt-1 text-muted-foreground">
              Manage platform, businesses, and users.
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2 rounded-full"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>

        <div className="mb-6 flex gap-1 rounded-2xl bg-primary p-1 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-primary-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "businesses" && <BusinessesTab />}
        {activeTab === "categories" && <CategoriesTab />}
        {activeTab === "reviews" && <ReviewsTab />}
        {activeTab === "users" && <UsersTab />}
      </main>
      <SiteFooter />
    </div>
  )
}
