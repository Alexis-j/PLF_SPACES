export function generatePassword(length = 14): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lower = "abcdefghijklmnopqrstuvwxyz"
  const digits = "0123456789"
  const symbols = "!@#$%^&*_-+="
  const all = upper + lower + digits + symbols

  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ]

  const rest = Array.from({ length: length - 4 }, () =>
    all[Math.floor(Math.random() * all.length)]
  )

  return [...required, ...rest].sort(() => Math.random() - 0.5).join("")
}
