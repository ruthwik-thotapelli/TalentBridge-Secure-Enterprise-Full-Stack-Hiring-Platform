import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

console.log("DB debug:", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export const testDBConnection = async () => {
  try {
    const conn = await db.getConnection();
    console.log("✅ MySQL connected successfully");
    conn.release();
  } catch (err) {
    console.error("❌ MySQL connection failed:", err);
  }
};

export default db;