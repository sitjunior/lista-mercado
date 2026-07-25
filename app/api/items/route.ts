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
