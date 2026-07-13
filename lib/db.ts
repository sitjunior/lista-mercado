import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 5,
    })
  }
  return pool
}

export async function query<T extends mysql.RowDataPacket[]>(
  sql: string,
  params?: any[]
) {
  const [rows] = await getPool().execute<T>(sql, params)
  return rows
}
