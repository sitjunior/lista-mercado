'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Item = {
  id: number
  name: string
  acquired: number
  created_at: string
}

export default function GroceryList() {
  const [items, setItems] = useState<Item[]>([])
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [dark, setDark] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const lastClickRef = useRef<{ id: number; time: number } | null>(null)
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function api(path: string, init?: RequestInit) {
    const t = window.location.pathname.split('/').filter(Boolean)[0] || ''
    const sep = path.includes('?') ? '&' : '?'
    return fetch(`${path}${sep}token=${t}`, init)
  }

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const hasClass = document.documentElement.classList.contains('dark')
    if (!hasClass && prefersDark) {
      document.documentElement.classList.add('dark')
    }
    setDark(hasClass || prefersDark)
  }, [])

  function toggleDark() {
    setDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }

  const fetchItems = useCallback(async () => {
    const res = await api('/api/items')
    const data = await res.json()
    setItems(data)
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  async function addItem() {
    if (!newName.trim()) return
    const res = await api('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    if (res.ok) {
      setNewName('')
      fetchItems()
      inputRef.current?.focus()
    }
  }

  async function toggleAcquired(item: Item) {
    await api(`/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acquired: !item.acquired }),
    })
    fetchItems()
  }

  async function deleteItem(id: number) {
    await api(`/api/items/${id}`, { method: 'DELETE' })
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    fetchItems()
  }

  async function deleteSelected() {
    for (const id of selectedIds) {
      await api(`/api/items/${id}`, { method: 'DELETE' })
    }
    setSelectedIds(new Set())
    fetchItems()
  }

  async function updateName(id: number) {
    if (!editName.trim()) return
    await api(`/api/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    })
    setEditingId(null)
    fetchItems()
  }

  function startEditing(item: Item) {
    setEditingId(item.id)
    setEditName(item.name)
    setTimeout(() => {
      const input = editInputRef.current
      if (input) {
        input.focus()
        input.setSelectionRange(input.value.length, input.value.length)
      }
    }, 0)
  }

  function handleClick(item: Item) {
    const now = Date.now()
    if (lastClickRef.current && lastClickRef.current.id === item.id && now - lastClickRef.current.time < 400) {
      startEditing(item)
      lastClickRef.current = null
    } else {
      lastClickRef.current = { id: item.id, time: now }
    }
  }

  function handleTouchStart(item: Item) {
    longPressRef.current = setTimeout(() => startEditing(item), 500)
  }

  function handleTouchEnd() {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleEditMode() {
    setEditMode((prev) => {
      if (prev) setSelectedIds(new Set())
      return !prev
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') addItem()
  }

  const pending = items.filter((i) => !i.acquired)
  const acquired = items.filter((i) => i.acquired)

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
          Mercado
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Alternar modo escuro/claro"
          >
            {dark ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <button
            onClick={toggleEditMode}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              editMode
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            {editMode ? 'Concluir' : 'Editar'}
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-lg border border-dashed border-zinc-300 px-3 py-2.5 dark:border-zinc-700">
        <div className="h-5 w-5 shrink-0 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-600" />
        <input
          ref={inputRef}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Novo item…"
          className="flex-1 bg-transparent text-base text-zinc-800 placeholder-zinc-400 outline-hidden dark:text-zinc-100 dark:placeholder-zinc-500"
        />
        {newName.trim() && (
          <button
            onClick={addItem}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Adicionar
          </button>
        )}
      </div>

      {pending.length > 0 && (
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Pendentes — {pending.length}
        </div>
      )}

      <ul className="mb-6 space-y-0.5">
        {pending.map((item) => (
          <li
            key={item.id}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
              selectedIds.has(item.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
          >
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
                onTouchStart={() => handleTouchStart(item)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchEnd}
                className="flex-1 text-left text-base text-zinc-800 dark:text-zinc-100"
              >
                {item.name}
              </button>
            )}

          </li>
        ))}
      </ul>

      {acquired.length > 0 && (
        <>
          <div className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Adquiridos — {acquired.length}
          </div>
          <ul className="space-y-0.5">
            {acquired.map((item) => (
              <li
                key={item.id}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                  selectedIds.has(item.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
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
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
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
                    onTouchStart={() => handleTouchStart(item)}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchEnd}
                    className="flex-1 text-left text-base text-zinc-400 line-through dark:text-zinc-500"
                  >
                    {item.name}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {editMode && selectedIds.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 flex justify-center p-4">
          <button
            onClick={deleteSelected}
            className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-red-700"
          >
            Apagar {selectedIds.size} selecionado{selectedIds.size > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  )
}
