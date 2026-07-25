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
