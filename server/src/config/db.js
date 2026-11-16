const { Pool } = require('pg')

// Pool duy trì sẵn nhiều connection thay vì mở/đóng mỗi request
// Mặc định tối đa 10 connections — đủ cho MVP
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false } // Bỏ comment nếu dùng cloud DB (Supabase, Neon, Railway...)
})

pool.on('connect', () => console.log('✅ Connected to PostgreSQL'))
pool.on('error', (err) => console.error('❌ Unexpected DB error:', err))

module.exports = {
  /**
   * Hàm query wrapper — dùng thay vì pool.query trực tiếp
   * Lý do: Sau này muốn thêm logging/tracing, chỉ cần sửa 1 chỗ ở đây
   * @param {string} text  - SQL string với placeholders ($1, $2...)
   * @param {any[]}  params - Mảng giá trị tương ứng với placeholder
   */
  query: (text, params) => pool.query(text, params),
  pool,
}
