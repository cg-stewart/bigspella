import { pgTable, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

export const tournaments = pgTable("tournaments", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  state: text("state").$type<"UPCOMING" | "IN_PROGRESS" | "COMPLETED">().notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  maxParticipants: integer("max_participants").notNull(),
  participants: jsonb("participants").$type<{
    userId: string;
    username: string;
    score: number;
    rank?: number;
    joinedAt: string;
  }[]>().notNull(),
  settings: jsonb("settings").$type<{
    roundDuration: number;
    difficultyLevel: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
    totalRounds: number;
    prizePool?: number;
  }>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
