/**
 * Response helpers — Laravel-style `response()->json()` sugar.
 */
export function json<T>(data: T, status = 200) {
  return Response.json(data, { status })
}

/**
 * Standard API envelope: `{ data: ... }`.
 */
export function withData<T>(data: T, status = 200) {
  return json({ data }, status)
}

/**
 * Standard API pagination envelope: `{ data, meta }`.
 */
export function paginated<T>(data: T[], meta: { total: number; page: number; perPage: number }) {
  return json({ data, meta })
}
