import { z } from "zod";
import { GameRoom } from "@bigspella/core/room";
import { rooms } from "@bigspella/core/db/schema/room.sql";
import { db } from "@bigspella/core/db/drizzle";
import { Util } from "@bigspella/core/util";

// Input validation schema
const CreateRoomSchema = z.object({
  name: z.string().min(1).max(50),
  hostPlayer: z.object({
    id: z.string(),
    username: z.string(),
    score: z.number(),
  }),
  settings: GameRoom.RoomSettings.partial(),
});

export const handler = Util.handler(async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const input = CreateRoomSchema.parse(body);

    // Create the room using the GameRoom module
    const room = GameRoom.createRoom(
      input.name,
      input.hostPlayer,
      input.settings
    );

    // Save to database
    await db.insert(rooms).values({
      ...room,
      createdAt: new Date(room.createdAt),
      updatedAt: new Date(room.updatedAt),
    });

    return {
      statusCode: 201,
      body: JSON.stringify(room),
    };
  } catch (error) {
    console.error("Error creating room:", error);

    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid input",
          errors: error.errors,
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
      }),
    };
  }
});
