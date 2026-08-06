"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Box, Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const navLinks = [
  { label: "Explore", href: "#explore" },
  { label: "Map", href: "#map" },
  { label: "Categories", href: "#categories" },
  { label: "For Owners", href: "#owners" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
          .then(({ data }) => setRole(data?.role ?? null))
      }
    })
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Box className="size-5" />
          </span>
          <span className="font-heading text-lg font-bold tracking-tight">
            PLF<span className="text-primary">Spaces</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {role === "super_admin" && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="rounded-full gap-2">
                    <User className="size-4" />
                    Admin
                  </Button>
                </Link>
              )}
              {role === "business_owner" && (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="rounded-full gap-2">
                    <User className="size-4" />
                    Dashboard
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="rounded-full">
                  Sign in
                </Button>
              </Link>
            </>
          )}

        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex size-10 items-center justify-center rounded-full border border-border md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary hover:text-secondary-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2">
            {user ? (
              <>
                {role === "super_admin" && (
                  <Link href="/admin" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full">
                      Admin Panel
                    </Button>
                  </Link>
                )}
                {role === "business_owner" && (
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full">
                      Dashboard
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <Link href="/auth" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full rounded-full">
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
