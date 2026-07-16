import { Search, Compass, Heart, MessageCircle } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Discover businesses",
    desc: "Browse by category, location, or map. Find restaurants, shops, services and more near you.",
  },
  {
    icon: Compass,
    title: "Explore in 3D",
    desc: "Take an immersive Matterport tour. Walk through the space, check the vibe, see every detail.",
  },
  {
    icon: Heart,
    title: "Connect & follow",
    desc: "Follow businesses, write reviews, save favorites, and stay updated with their latest posts.",
  },
]

const stats = [
  { value: "10", label: "Founding businesses" },
  { value: "6", label: "Categories" },
  { value: "4.8", label: "Average rating" },
  { value: "1.2K+", label: "3D tours taken" },
]

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Explore businesses in three steps
        </h2>
        <p className="mt-3 text-pretty text-muted-foreground">
          From discovery to connection, PLF Spaces makes exploring local
          businesses effortless.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((step, i) => {
          const Icon = step.icon
          return (
            <div
              key={step.title}
              className="relative rounded-3xl border border-border bg-card p-8 transition-shadow hover:shadow-lg"
            >
              <span className="absolute right-6 top-6 font-heading text-5xl font-bold text-secondary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.desc}
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-16 grid grid-cols-2 gap-6 rounded-3xl border border-border bg-secondary/40 p-8 md:grid-cols-4 lg:p-10">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
