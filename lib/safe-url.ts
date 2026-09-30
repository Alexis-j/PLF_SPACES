// Una única allowlist de esquemas para todo lo que llega a un href o a
// window.open().
//
// El problema que resuelve: React no sanea el esquema de un href.
// Un owner podía guardar `javascript:alert(1)` en businesses.website y
// se ejecutaba en nuestro propio origen al hacer clic, con la sesión y
// las cookies de la víctima. La allowlist se aplica en el servidor (para
// que el valor ni se guarde) y también en el render (para que un valor
// ya almacenado antes del arreglo siga siendo inocuo).

const ALLOWED_SCHEMES = ["http:", "https:", "mailto:", "tel:"]

/**
 * Devuelve la URL si su esquema es seguro, o null si no lo es.
 *
 * Un valor sin esquema ("instagram.com/plf") se trata como no seguro y
 * se descarta: no hay forma de distinguirlo de un protocolo relativo
 * sin parsear contra una base, y permitir relativos abriría la puerta a
 * destinos internos inesperados.
 */
export function safeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()
  if (!trimmed) return null

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return null
  }

  return ALLOWED_SCHEMES.includes(parsed.protocol) ? trimmed : null
}

/**
 * Igual que safeUrl pero devuelve string vacío en vez de null, para los
 * campos del formulario y del body que el backend guarda como TEXT.
 */
export function safeUrlOrEmpty(value: unknown): string {
  return safeUrl(value) ?? ""
}

/**
 * Instagram se almacena como handle ("@plfspaces"), no como URL, así que
 * no pasa por el parser. Lo que hay que impedir es que el handle se
 * escape del href construido en el render.
 */
export function safeHandle(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim().replace(/^@/, "")
  if (!/^[A-Za-z0-9._]{1,30}$/.test(trimmed)) return null

  return trimmed
}
