# Item Fields (Preço, Quantidade, Data, Local) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) for syntax tracking.

**Goal:** Add Preço, Quantidade, Data, and Local columns to each grocery item.

**Architecture:** New DB migration adds 4 nullable columns. API routes are extended to read/write them. The GroceryList component renders each item as a 2-line grid: line 1 = checkbox + name, line 2 = 4 editable fields.

**Tech Stack:** MySQL 8, Next.js 16, React 19, Tailwind v4

---

### Task 1: Database Migration

**Files:**
- Create: `migrations/002_add_item_fields.sql`

- [ ] **Step 1: Create migration file**

```sql
ALTER TABLE items
  ADD COLUMN price DECIMAL(10,2) DEFAULT NULL,
  ADD COLUMN quantity INT DEFAULT NULL,
  ADD COLUMN date DATE DEFAULT NULL,
  ADD COLUMN location VARCHAR(50) DEFAULT NULL;
```

- [ ] **Step 2: Commit**

```bash
git add migrations/002_add_item_fields.sql
git commit -m "feat: add price, quantity, date, location columns to items table"
```

---

### Task 2: Update GET/POST API routes

**Files:**
- Modify: `app/api/items/route.ts`

- [ ] **Step 1: Update GET and POST in app/api/items/route.ts**

Replace the content with fields added:

```ts
import { getPool, query } from '@/lib/db'
import mysql from 'mysql2/promise'

interface ItemRow extends mysql.RowDataPacket {
  id: number
  name: string
  acquired: number
  created_at: string
  price: number | null
  quantity: number | null
  date: string | null
  location: string | null
}

export async function GET() {
  const rows = await query<ItemRow[]>(
    'SELECT id, name, acquired, created_at, price, quantity, date, location FROM items ORDER BY acquired ASC, LOWER(name) ASC'
  )
  return Response.json(rows)
}

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
  const [result] = await getPool().execute<mysql.ResultSetHeader>(
    'INSERT INTO items (name, price, quantity, date, location) VALUES (?, ?, ?, ?, ?)',
    [name.trim(), price ?? null, quantity ?? null, date ?? null, location ?? null]
  )
  const [rows] = await getPool().execute<ItemRow[]>(
    'SELECT id, name, acquired, created_at, price, quantity, date, location FROM items WHERE id = ?',
    [result.insertId]
  )
  return Response.json(rows[0], { status: 201 })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/items/route.ts
git commit -m "feat: add new fields to GET and POST /api/items"
```

---

### Task 3: Update PATCH/DELETE API route

**Files:**
- Modify: `app/api/items/[id]/route.ts`

- [ ] **Step 1: Update PATCH in app/api/items/[id]/route.ts**

Replace the body parsing and update logic:

```ts
import { getPool } from '@/lib/db'
import mysql from 'mysql2/promise'

interface ItemRow extends mysql.RowDataPacket {
  id: number
  name: string
  acquired: number
  created_at: string
  price: number | null
  quantity: number | null
  date: string | null
  location: string | null
}

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = (await _request.json()) as {
    acquired?: boolean
    name?: string
    price?: number | null
    quantity?: number | null
    date?: string | null
    location?: string | null
  }

  const sets: string[] = []
  const vals: any[] = []

  if (body.name !== undefined) {
    if (!body.name.trim()) {
      return Response.json({ error: 'name cannot be empty' }, { status: 400 })
    }
    sets.push('name = ?')
    vals.push(body.name.trim())
  }

  if (body.acquired !== undefined) {
    sets.push('acquired = ?')
    vals.push(body.acquired ? 1 : 0)
  }

  if (body.price !== undefined) {
    sets.push('price = ?')
    vals.push(body.price)
  }

  if (body.quantity !== undefined) {
    sets.push('quantity = ?')
    vals.push(body.quantity)
  }

  if (body.date !== undefined) {
    sets.push('date = ?')
    vals.push(body.date || null)
  }

  if (body.location !== undefined) {
    sets.push('location = ?')
    vals.push(body.location || null)
  }

  if (sets.length > 0) {
    await getPool().execute(
      `UPDATE items SET ${sets.join(', ')} WHERE id = ?`,
      [...vals, id]
    )
  }

  const [rows] = await getPool().execute<ItemRow[]>(
    'SELECT id, name, acquired, created_at, price, quantity, date, location FROM items WHERE id = ?',
    [id]
  )

  if (rows.length === 0) {
    return Response.json({ error: 'not found' }, { status: 404 })
  }

  return Response.json(rows[0])
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await getPool().execute('DELETE FROM items WHERE id = ?', [id])
  return new Response(null, { status: 204 })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/items/[id]/route.ts
git commit -m "feat: add new fields to PATCH /api/items/[id]"
```

---

### Task 4: Update GroceryList component with new fields

**Files:**
- Modify: `components/GroceryList.tsx`

- [ ] **Step 1: Update Item type and add price formatting helpers**

Replace the type definition and add helpers after the imports:

```ts
type Item = {
  id: number
  name: string
  acquired: number
  created_at: string
  price: number | null
  quantity: number | null
  date: string | null
  location: string | null
}

function formatPrice(value: number | null): string {
  if (value === null) return ''
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function parsePrice(raw: string): number | null {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null
  return parseInt(digits, 10) / 100
}
```

- [ ] **Step 2: Add priceInputs state and saveItemField helper**

Add to the useState declarations (after the `const [dark, setDark]` line):

```ts
const [priceInputs, setPriceInputs] = useState<Record<number, string>>({})
```

Add this helper function (before `fetchItems`):

```ts
async function saveItemField(id: number, field: string, value: any) {
  await api(`/api/items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ [field]: value }),
  })
  fetchItems()
}
```

- [ ] **Step 3: Update the pending items rendering**

Replace the pending items `<li>` block (lines 215–270) with the grid version:

```tsx
{pending.map((item) => (
  <li
    key={item.id}
    className={`group flex flex-col rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
      selectedIds.has(item.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
    }`}
  >
    <div className="flex items-center gap-3">
      {editMode ? (
        <button
          onClick={() => toggleSelect(item.id)}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
            selectedIds.has(item.id)
              ? 'border-blue-600 bg-blue-600 dark:border-blue-400 dark:bg-blue-400'
              : 'border-zinc-300 dark:border-zinc-600'
          }`}
        >
          {selectedIds.has(item.id) && (
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      ) : (
        <button
          onClick={() => toggleAcquired(item)}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-zinc-300 transition-colors hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500"
        >
          <div className="h-2.5 w-2.5 rounded-full bg-transparent" />
        </button>
      )}

      {editingId === item.id ? (
        <input
          ref={editInputRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={() => updateName(item.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateName(item.id)
            if (e.key === 'Escape') setEditingId(null)
          }}
          className="flex-1 bg-transparent text-base text-zinc-800 outline-hidden dark:text-zinc-100"
        />
      ) : (
        <button
          type="button"
          onClick={() => handleClick(item)}
          className="flex-1 text-left text-base text-zinc-800 dark:text-zinc-100"
        >
          {item.name}
        </button>
      )}
    </div>

    <div className="mt-1 grid grid-cols-2 gap-1 sm:grid-cols-4">
      <input
        value={priceInputs[item.id] ?? formatPrice(item.price)}
        onChange={(e) => {
          const raw = e.target.value
          const parsed = parsePrice(raw)
          setPriceInputs((prev) => ({
            ...prev,
            [item.id]: raw,
          }))
        }}
        onBlur={() => {
          const raw = priceInputs[item.id]
          if (raw !== undefined) {
            saveItemField(item.id, 'price', parsePrice(raw))
            setPriceInputs((prev) => {
              const next = { ...prev }
              delete next[item.id]
              return next
            })
          }
        }}
        placeholder="R$ 0,00"
        className="w-full rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-xs text-zinc-700 outline-hidden focus:border-blue-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:focus:border-blue-500"
      />
      <input
        type="number"
        min="0"
        value={item.quantity ?? ''}
        onChange={(e) => {
          const v = e.target.value
          saveItemField(item.id, 'quantity', v ? parseInt(v, 10) : null)
        }}
        placeholder="Qtd"
        className="w-full rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-xs text-zinc-700 outline-hidden focus:border-blue-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:focus:border-blue-500"
      />
      <input
        type="date"
        value={item.date ?? ''}
        onChange={(e) => saveItemField(item.id, 'date', e.target.value || null)}
        className="w-full rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-xs text-zinc-700 outline-hidden focus:border-blue-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:focus:border-blue-500"
      />
      <select
        value={item.location ?? ''}
        onChange={(e) => saveItemField(item.id, 'location', e.target.value || null)}
        className="w-full rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-xs text-zinc-700 outline-hidden focus:border-blue-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:focus:border-blue-500"
      >
        <option value="">Local</option>
        <option value="Gigante">Gigante</option>
        <option value="Rio Verde">Rio Verde</option>
        <option value="Max">Max</option>
        <option value="Condor">Condor</option>
        <option value="Atacadão">Atacadão</option>
        <option value="Circuito">Circuito</option>
        <option value="Carrefour">Carrefour</option>
      </select>
    </div>
  </li>
))}
```

- [ ] **Step 4: Update the acquired items rendering**

Replace the acquired items `<li>` block (lines 279–344) with the same grid version (with strikethrough styles):

```tsx
{acquired.map((item) => (
  <li
    key={item.id}
    className={`group flex flex-col rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
      selectedIds.has(item.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
    }`}
  >
    <div className="flex items-center gap-3">
      {editMode ? (
        <button
          onClick={() => toggleSelect(item.id)}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
            selectedIds.has(item.id)
              ? 'border-blue-600 bg-blue-600 dark:border-blue-400 dark:bg-blue-400'
              : 'border-zinc-300 dark:border-zinc-600'
          }`}
        >
          {selectedIds.has(item.id) && (
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      ) : (
        <button
          onClick={() => toggleAcquired(item)}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-green-400 bg-green-400"
        >
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      )}

      {editingId === item.id ? (
        <input
          ref={editInputRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={() => updateName(item.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateName(item.id)
            if (e.key === 'Escape') setEditingId(null)
          }}
          className="flex-1 bg-transparent text-base text-zinc-400 line-through outline-hidden dark:text-zinc-500"
        />
      ) : (
        <button
          type="button"
          onClick={() => handleClick(item)}
          className="flex-1 text-left text-base text-zinc-400 line-through dark:text-zinc-500"
        >
          {item.name}
        </button>
      )}
    </div>

    <div className="mt-1 grid grid-cols-2 gap-1 sm:grid-cols-4">
      <input
        value={priceInputs[item.id] ?? formatPrice(item.price)}
        onChange={(e) => {
          setPriceInputs((prev) => ({
            ...prev,
            [item.id]: e.target.value,
          }))
        }}
        onBlur={() => {
          const raw = priceInputs[item.id]
          if (raw !== undefined) {
            saveItemField(item.id, 'price', parsePrice(raw))
            setPriceInputs((prev) => {
              const next = { ...prev }
              delete next[item.id]
              return next
            })
          }
        }}
        placeholder="R$ 0,00"
        className="w-full rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-xs text-zinc-400 line-through focus:not-last:line-through dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500"
      />
      <input
        type="number"
        min="0"
        value={item.quantity ?? ''}
        onChange={(e) => {
          const v = e.target.value
          saveItemField(item.id, 'quantity', v ? parseInt(v, 10) : null)
        }}
        placeholder="Qtd"
        className="w-full rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-xs text-zinc-400 line-through dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500"
      />
      <input
        type="date"
        value={item.date ?? ''}
        onChange={(e) => saveItemField(item.id, 'date', e.target.value || null)}
        className="w-full rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-xs text-zinc-400 line-through dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500"
      />
      <select
        value={item.location ?? ''}
        onChange={(e) => saveItemField(item.id, 'location', e.target.value || null)}
        className="w-full rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-xs text-zinc-400 line-through dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500"
      >
        <option value="">Local</option>
        <option value="Gigante">Gigante</option>
        <option value="Rio Verde">Rio Verde</option>
        <option value="Max">Max</option>
        <option value="Condor">Condor</option>
        <option value="Atacadão">Atacadão</option>
        <option value="Circuito">Circuito</option>
        <option value="Carrefour">Carrefour</option>
      </select>
    </div>
  </li>
))}
```

- [ ] **Step 5: Run build to verify**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add components/GroceryList.tsx
git commit -m "feat: add price, quantity, date, location fields to GroceryList UI"
```

---

### Task 5: Apply migration to database

**Files:**
- N/A (run migration against MySQL)

- [ ] **Step 1: Run the migration**

```bash
mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < migrations/002_add_item_fields.sql
```

- [ ] **Step 2: Test the app**

```bash
npm run dev
```

Verify the app loads, items display with the new 4-field grid, editing works for all fields.
