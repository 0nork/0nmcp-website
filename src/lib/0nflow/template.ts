/**
 * Tiny {{path.deep}} template engine for flow params.
 * Resolves against the dispatch context — contact, flow, env basics.
 */

export function resolveTemplate(
  value: unknown,
  ctx: Record<string, unknown>,
): unknown {
  if (typeof value === 'string') return resolveString(value, ctx)
  if (Array.isArray(value)) return value.map((v) => resolveTemplate(v, ctx))
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = resolveTemplate(v, ctx)
    }
    return out
  }
  return value
}

function resolveString(str: string, ctx: Record<string, unknown>): string {
  return str.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_match, path: string) => {
    const v = getPath(ctx, path.trim())
    return v == null ? '' : String(v)
  })
}

function getPath(obj: unknown, path: string): unknown {
  const parts = path.split('.').map((p) => p.trim()).filter(Boolean)
  let cur: unknown = obj
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p]
    } else {
      return undefined
    }
  }
  return cur
}
