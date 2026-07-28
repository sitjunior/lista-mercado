# Quick Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a server-side search with debounce that filters grocery items by name via SQL LIKE.

**Architecture:** A search input in `GroceryList.tsx` sends debounced requests to `GET /api/items?q=<term>` which adds `WHERE name LIKE '%term%'` to the SQL query. Results keep existing grouping (pending/acquired).

**Tech Stack:** Next.js 16.2, MySQL 8, Tailwind CSS v4

---

### Task 1: Add `q` parameter to GET /api/items

**Files:**
- Modify: `app/api/items/route.ts:22-26`

- [ ] **Step 1: Update the GET handler to accept `q` parameter**

Replace the existing GET function:

```ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  let sql = 'SELECT id, name, acquired, created_at, price, quantity, date, location FROM items'
  const params: string[] = []

  if (q && q.trim()) {
    sql += ' WHERE name LIKE ?'
    params.push(`%${q.trim()}%`)
  }

  sql += ' ORDER BY acquired ASC, LOWER(name) ASC'

  const rows = await query<ItemRow[]>(sql, params)
  return Response.json(rows.map(mapRow))
}
```

- [ ] **Step 2: Build to verify**

Run: `npm run build`
Expected: Build passes without errors.

---

### Task 2: Add search input + debounce to GroceryList

**Files:**
- Modify: `components/GroceryList.tsx`

- [ ] **Step 1: Add search state and fetchItems param**

After `const [editMode, setEditMode] = useState(false)` (line 59), add:

```tsx
const [searchQuery, setSearchQuery] = useState('')
```

Replace the `fetchItems` function (lines 91-95) with:

```tsx
const fetchItems = useCallback(async (q?: string) => {
  const url = q ? `/api/items?q=${encodeURIComponent(q)}` : '/api/items'
  const res = await api(url)
  const data = await res.json()
  setItems(data)
}, [])
```

- [ ] **Step 2: Add debounce effect**

After the `useEffect` that calls `fetchItems()` (line 97-99), add:

```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    fetchItems(searchQuery)
  }, 300)
  return () => clearTimeout(timer)
}, [searchQuery, fetchItems])
```

Replace the `useEffect(() => { fetchItems() }, [fetchItems])` block with just `fetchItems()` being triggered by the debounce effect when `searchQuery` is empty string.

Wait — need to refactor. The initial load should work too. Let me think...

The initial load happens when `searchQuery` is `''` (default). The debounce sees `''` and calls `fetchItems()` (no param). The debounce effect above replaces the old `useEffect(() => { fetchItems() }, [fetchItems])` entirely.

Remove lines 97-99 (the old useEffect):

```tsx
useEffect(() => {
  fetchItems()
}, [fetchItems])
```

The debounce effect already handles it:

```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    fetchItems(searchQuery)
  }, 300)
  return () => clearTimeout(timer)
}, [searchQuery, fetchItems])
```

When `searchQuery` is `''`, `fetchItems('')` calls API with `q=` which returns all items (since we check `q && q.trim()` in the API).

- [ ] **Step 3: Add search input JSX**

After the closing `</div>` of the header section (line 240, after the edit button div), before the "Novo item" input, add:

```tsx
<div className="relative mb-6">
  <svg
    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
  <input
    type="search"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Buscar…"
    suppressHydrationWarning
    className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-3 text-sm text-zinc-700 outline-hidden placeholder-zinc-400 focus:border-blue-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:placeholder-zinc-500 dark:focus:border-blue-500"
  />
</div>
```

- [ ] **Step 4: Add empty state when search returns no results**

After the opening `<ul className="mb-6 space-y-0.5">` (line 269), and the same for acquired section, the existing rendering handles zero-length arrays fine (no items rendered). But we need a message.

Actually, looking at the component, if `pending.length === 0` and `searchQuery` is set and there are no items at all, nothing shows. Let me add the empty state.

After the closing `</ul>` for pending items (line 407) and before the acquired section check (line 409), or rather — after both sections, add an empty state. Actually the simplest: after the closing `</ul>` at line 407, add:

```tsx
{searchQuery && items.length === 0 && (
  <div className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
    Nenhum item encontrado
  </div>
)}
```

Wait but the items are split into `pending` and `acquired` arrays. When search returns 0 results, both arrays are empty. The existing code checks `pending.length > 0` and `acquired.length > 0` for the section headers. So both sections just won't render. The empty state message should appear.

Let me add it right after the pending list and before the acquired section.

After the `</ul>` closing tag at line 407, before the `{acquired.length > 0` line (409):

```tsx
{searchQuery && pending.length === 0 && acquired.length === 0 && (
  <div className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
    Nenhum item encontrado
  </div>
)}
```

- [ ] **Step 5: Build to verify**

Run: `npm run build`
Expected: Build passes without errors.
