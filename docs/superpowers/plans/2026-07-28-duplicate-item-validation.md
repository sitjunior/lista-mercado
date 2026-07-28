# Duplicate Item Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent duplicate item names with server-side validation and a client-side error modal.

**Architecture:** POST /api/items checks `SELECT id FROM items WHERE LOWER(name) = LOWER(?)` before insert and returns 409 if duplicate. The client shows a modal with "Item já cadastrado!" on 409.

**Tech Stack:** Next.js 16.2, MySQL 8, Tailwind CSS v4

---

### Task 1: Add duplicate check to POST /api/items

**Files:**
- Modify: `app/api/items/route.ts:29-58`

- [ ] **Step 1: Add duplicate validation to POST handler**

Replace the existing POST function with:

```ts
export async function POST(request: Request) {
  const { name, price, quantity, date, location } = (await request.json()) as {
    name: string
    price?: number | null
    quantity?: number | null
    date?: string | null
    location?: string | null
  }
  if (!name || typeof name !== 'string' || !name.trim()) {
    return Response.json({ error: 'name is required' }, { status: 400 })
  }

  const [existing] = await getPool().execute<ItemRow[]>(
    'SELECT id FROM items WHERE LOWER(name) = LOWER(?)',
    [name.trim()]
  )
  if (existing.length > 0) {
    return Response.json({ error: 'Item já cadastrado!' }, { status: 409 })
  }

  const [result] = await getPool().execute<mysql.ResultSetHeader>(
    'INSERT INTO items (name, price, quantity, date, location) VALUES (?, ?, ?, ?, ?)',
    [name.trim(), price ?? null, quantity ?? null, date ?? null, location ?? null]
  )
  const [rows] = await getPool().execute<ItemRow[]>(
    'SELECT id, name, acquired, created_at, price, quantity, date, location FROM items WHERE id = ?',
    [result.insertId]
  )
  return Response.json(mapRow(rows[0]), { status: 201 })
}
```

- [ ] **Step 2: Build to verify**

Run: `npm run build`
Expected: Build passes without errors.

### Task 2: Add error modal in addItem

**Files:**
- Modify: `components/GroceryList.tsx`

- [ ] **Step 1: Add error state**

After `const [searchQuery, setSearchQuery] = useState('')` (line 60), add:

```tsx
const [errorMessage, setErrorMessage] = useState<string | null>(null)
```

- [ ] **Step 2: Update addItem to handle 409**

Replace the `addItem` function (lines 110-122) with:

```tsx
async function addItem() {
  if (!newName.trim()) return
  const res = await api('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName.trim() }),
  })
  if (res.status === 409) {
    const data = await res.json()
    setErrorMessage(data.error)
    return
  }
  if (res.ok) {
    setNewName('')
    fetchItems()
    inputRef.current?.focus()
  }
}
```

- [ ] **Step 3: Add modal JSX**

Before the closing `</div>` of the root div (the final `</div>` at the end of the component), add:

```tsx
{errorMessage && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
      <p className="text-center text-base font-medium text-zinc-800 dark:text-zinc-100">
        {errorMessage}
      </p>
      <div className="mt-5 flex justify-center">
        <button
          onClick={() => setErrorMessage(null)}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 4: Build to verify**

Run: `npm run build`
Expected: Build passes without errors.
