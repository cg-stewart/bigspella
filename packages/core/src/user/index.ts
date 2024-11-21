import { db } from "../db/drizzle";
import { users } from "../db/schema/user.sql";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export module User {
  export type UserType = typeof users.$inferSelect;
  export type NewUserType = typeof users.$inferInsert;

  export async function create(
    cognitoId: string,
    email: string,
    username: string
  ) {
    const newUser: NewUserType = {
      id: randomUUID(),
      cognitoId,
      email,
      username,
      gamesPlayed: 0,
      gamesWon: 0,
      totalScore: 0,
    };

    await db.insert(users).values(newUser);
    return newUser;
  }

  export async function getById(id: string) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  export async function getByCognitoId(cognitoId: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.cognitoId, cognitoId));
    return result[0];
  }

  export async function update(id: string, updates: Partial<NewUserType>) {
    const { cognitoId, email, ...allowedUpdates } = updates; // Prevent updating sensitive fields
    await db
      .update(users)
      .set({ ...allowedUpdates, updatedAt: new Date() })
      .where(eq(users.id, id));
    return getById(id);
  }

  export async function updateStats(id: string, won: boolean, score: number) {
    await db
      .update(users)
      .set({
        gamesPlayed: sql`${users.gamesPlayed} + 1`,
        gamesWon: won ? sql`${users.gamesWon} + 1` : users.gamesWon,
        totalScore: sql`${users.totalScore} + ${score}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
    return getById(id);
  }
}
