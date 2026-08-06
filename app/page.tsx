import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { FeaturedBusinesses } from "@/components/featured-businesses"
import { MapExplore } from "@/components/map-explore"
import { ImmersiveTour } from "@/components/immersive-tour"
import { HowItWorks } from "@/components/how-it-works"
import { BusinessCta } from "@/components/business-cta"
import { SiteFooter } from "@/components/site-footer"
import { getBusinesses } from "@/lib/data"

export const revalidate = 60

export default async function Page() {
  const businesses = await getBusinesses()

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <MapExplore businesses={businesses} />
        <FeaturedBusinesses businesses={businesses} />
        <ImmersiveTour />
        <HowItWorks />
        <BusinessCta />
      </main>
      <SiteFooter />
    </div>
  )
}
