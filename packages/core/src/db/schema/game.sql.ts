import { pgTable, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

export const games = pgTable("games", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  meetingId: text("meeting_id").notNull(),
  state: text("state").$type<"LOBBY" | "IN_PROGRESS" | "COMPLETED">().notNull(),
  hostId: text("host_id").notNull(),
  players: jsonb("players").$type<{
    id: string;
    username: string;
    score: number;
    attendeeId: string;
    isHost: boolean;
    isReady: boolean;
  }[]>().notNull(),
  settings: jsonb("settings").$type<{
    maxPlayers: number;
    roundDuration: number;
    difficultyLevel: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
    totalRounds: number;
  }>().notNull(),
  currentRound: integer("current_round").notNull(),
  currentWord: text("current_word"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
