import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { BusinessesGrid } from "@/components/businesses-grid"
import { getBusinesses } from "@/lib/data"

export const revalidate = 60

export default async function BusinessesPage() {
  const businesses = await getBusinesses()

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            All Businesses
          </h1>
          <p className="mt-2 text-muted-foreground">
            Discover and explore local businesses in your area.
          </p>
        </div>

        <BusinessesGrid businesses={businesses} />
      </main>
      <SiteFooter />
    </div>
  )
}
