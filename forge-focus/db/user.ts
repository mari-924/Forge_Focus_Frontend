import type { SQLiteDatabase } from "expo-sqlite";
import type { User } from "@/types/types";

export interface NewUser {
  googleId?: string | null;
  username: string;
  email: string;
  profile_pic: string | null;
}

export function makeUsersRepo(db: SQLiteDatabase) {
  return {
    async getByEmail(email: string): Promise<User | null> {
      return db.getFirstAsync<User>(
        "SELECT * FROM user WHERE email = ?",
        [email]
      );
    },

    async getByGoogleId(g_id: string): Promise<User | null> {
      return db.getFirstAsync<User>(
        "SELECT * FROM user WHERE g_id = ?",
        [g_id]
      );
    },

    async upsert(newUser: NewUser): Promise<User> {
      const existing = await db.getFirstAsync<User>(
        "SELECT * FROM user WHERE email = ?",
        [newUser.email]
      );
    
      if (existing) {
        await db.runAsync(
          "UPDATE user SET username = ?, profile_pic = ?, g_id = ? WHERE email = ?",
          [
            newUser.username,        // ALWAYS overwrite
            newUser.profile_pic,     // ALWAYS overwrite
            newUser.googleId ?? existing.googleId, // overwrite only if provided
            newUser.email
          ]
        );
    
        return await db.getFirstAsync<User>(
          "SELECT * FROM user WHERE email = ?",
          [newUser.email]
        ) as User;
      }
    
      // otherwise create new
      return await this.create(newUser);
    },
    

    async create(newUser: NewUser): Promise<User> {
      const username = (newUser.username ?? "").trim();
      const email = (newUser.email ?? "").trim();
      const gId = newUser.googleId ?? null;
      const profilePic = newUser.profile_pic ?? null;

      if (!username || !email) throw new Error("username and email are required");

      await db.runAsync(
        "INSERT INTO user (g_id, username, email, profile_pic) VALUES (?, ?, ?, ?)",
        [gId, username, email, profilePic]
      );

      const created = await db.getFirstAsync<User>(
        "SELECT * FROM user WHERE email = ?",
        [email]
      );
      if (!created) throw new Error("Failed to load created user");
      return created;
    },
  };
}
