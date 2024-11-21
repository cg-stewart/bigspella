import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { GameRoom } from "../../room";

export const rooms = pgTable("rooms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  settings: jsonb("settings").$type<GameRoom.RoomSettings>().notNull(),
  state: text("state").$type<GameRoom.RoomState>().notNull(),
  players: jsonb("players").$type<GameRoom.Player[]>().notNull(),
  currentRound: integer("current_round").notNull(),
  totalRounds: integer("total_rounds").notNull(),
  currentWord: text("current_word"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;
