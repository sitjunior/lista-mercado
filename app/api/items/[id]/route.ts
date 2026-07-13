import { getPool } from '@/lib/db'
import mysql from 'mysql2/promise'

interface ItemRow extends mysql.RowDataPacket {
  id: number
  name: string
  acquired: number
  created_at: string
}

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { acquired, name } = (await _request.json()) as {
    acquired?: boolean
    name?: string
  }

  if (name !== undefined) {
    if (!name.trim()) {
      return Response.json({ error: 'name cannot be empty' }, { status: 400 })
    }
    await getPool().execute('UPDATE items SET name = ? WHERE id = ?', [
      name.trim(),
      id,
    ])
  }

  if (acquired !== undefined) {
    await getPool().execute('UPDATE items SET acquired = ? WHERE id = ?', [
      acquired ? 1 : 0,
      id,
    ])
  }

  const [rows] = await getPool().execute<ItemRow[]>(
    'SELECT id, name, acquired, created_at FROM items WHERE id = ?',
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
