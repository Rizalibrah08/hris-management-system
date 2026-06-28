import mysql from 'mysql2/promise'

const ssl = process.env.DB_SSL_CA
  ? { ca: Buffer.from(process.env.DB_SSL_CA, 'base64'), rejectUnauthorized: true }
  : undefined

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hris_db',
  waitForConnections: true,
  connectionLimit: 10,
  ...(ssl ? { ssl } : {}),
})

export async function query(text, params = []) {
  const [rows] = await pool.execute(text, params)
  return rows
}
