import type { SQLiteDatabase } from "expo-sqlite";


export async function initDB(db: SQLiteDatabase) {
  console.log("Database Initializing");

  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        g_id TEXT UNIQUE,
        name TEXT,
        email TEXT UNIQUE,
        profile_pic TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      `);
      console.log("Database Initialized Successfully");
    } catch (e) {
      console.error("Database Error: ", e);
    }
}