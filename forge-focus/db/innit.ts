import type { SQLiteDatabase } from "expo-sqlite";


export async function initDB(db: SQLiteDatabase) {
  console.log("Database Initializing");

  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        g_id TEXT UNIQUE,
        username TEXT,
        email TEXT UNIQUE,
        profile_pic TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        age INTEGER,
        weight INTEGER,
        height INTEGER,
        skill_level TEXT,
        FOREIGN KEY(user_id) REFERENCES user(id)
      );
      `);
      console.log("Database Initialized Successfully");
    } catch (e) {
      console.error("Database Error: ", e);
    }
}