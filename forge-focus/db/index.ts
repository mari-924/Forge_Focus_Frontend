import { useSQLiteContext, type SQLiteDatabase } from "expo-sqlite";
import { makeUsersRepo } from "../db/user";
export type DB = SQLiteDatabase;

export function useDB(): DB {
  return useSQLiteContext();
}
export function useRepos() {
    const db = useDB();
    return {
      db,
      users: makeUsersRepo(db)
    };
  }