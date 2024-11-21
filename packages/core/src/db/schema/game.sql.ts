import { pgTable, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

export const games = pgTable("games", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  meetingId: text("meeting_id").notNull(),
  state: text("state").$type<
    "LOBBY" | "ROUND_STARTING" | "ROUND_IN_PROGRESS" | "ROUND_ENDED" | "COMPLETED"
  >().notNull(),
  hostId: text("host_id").notNull(),
  players: jsonb("players").$type<{
    id: string;
    username: string;
    score: number;
    eloRating: number;
    attendeeId: string;
    isHost: boolean;
    isReady: boolean;
    achievements: {
      id: string;
      name: string;
      description: string;
      earnedAt: string;
    }[];
    roundStats: {
      roundNumber: number;
      score: number;
      word?: string;
      timeToAnswer?: number;
      isCorrect: boolean;
    }[];
  }[]>().notNull(),
  settings: jsonb("settings").$type<{
    maxPlayers: number;
    roundDuration: number;
    difficultyLevel: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
    totalRounds: number;
    scoringConfig: {
      basePoints: number;
      timeBonus: number;
      streakBonus: number;
      difficultyMultiplier: number;
    };
  }>().notNull(),
  currentRound: integer("current_round").notNull(),
  currentWord: text("current_word"),
  roundStartTime: timestamp("round_start_time"),
  roundEndTime: timestamp("round_end_time"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
