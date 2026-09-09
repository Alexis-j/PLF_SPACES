export type PasswordStrengthResult = {
  score: 0 | 1 | 2 | 3 | 4
  valid: boolean
  message: string
  checks: {
    length: boolean
    number: boolean
    lower: boolean
    upper: boolean
    symbol: boolean
  }
}

export function passwordStrength(password: string): PasswordStrengthResult {
  const checks = {
    length: password.length >= 8,
    number: /[0-9]/.test(password),
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  }

  let score = 0
  if (checks.length) score++
  if (password.length >= 12) score++
  if (checks.number) score++
  if (checks.lower && checks.upper) score++
  if (checks.symbol) score++
  score = Math.min(score, 4) as PasswordStrengthResult["score"]

  const failed = (Object.keys(checks) as (keyof typeof checks)[]).filter(
    (k) => !checks[k]
  )

  let message = "Password is strong"
  if (failed.length > 0) {
    const labels: Record<string, string> = {
      length: "at least 8 characters",
      number: "a number",
      lower: "a lowercase letter",
      upper: "an uppercase letter",
      symbol: "a symbol",
    }
    message = failed.map((k) => labels[k]).join(", ")
    message = `Add ${message}`
  }

  return {
    score: score as PasswordStrengthResult["score"],
    valid: failed.length === 0,
    message,
    checks,
  }
}

export function PasswordStrength({
  value,
}: {
  value: string
}) {
  if (!value) return null

  const { score } = passwordStrength(value)

  const labels = [
    { label: "Weak", color: "bg-red-500" },
    { label: "Fair", color: "bg-orange-400" },
    { label: "Good", color: "bg-yellow-400" },
    { label: "Strong", color: "bg-green-500" },
    { label: "Very strong", color: "bg-emerald-500" },
  ]

  const active = labels[score]

  return (
    <div className="w-full space-y-1">
      <div className="flex gap-1">
        {labels.map((l, i) => (
          <div
            key={l.label}
            className={`h-1 flex-1 rounded-full ${
              i <= score ? l.color : "bg-border"
            }`}
          />
        ))}
      </div>
      <p className="text-[10px] font-medium text-muted-foreground">
        {active.label}
      </p>
    </div>
  )
}
