import { z } from "zod";
import { Util } from "@bigspella/core/util";
import { GameService } from "@bigspella/core/game";

const createGameSchema = z.object({
  name: z.string().min(1).max(50),
  settings: z
    .object({
      maxPlayers: z.number().int().min(2).max(8).optional(),
      roundDuration: z.number().int().min(30).max(300).optional(),
      difficultyLevel: z.enum(["EASY", "MEDIUM", "HARD", "EXPERT"]).optional(),
      totalRounds: z.number().int().min(1).max(20).optional(),
    })
    .optional(),
});

export const main = Util.handler(async (event) => {
  const body = JSON.parse(event.body || "{}");
  const { name, settings } = createGameSchema.parse(body);

  // Get userId from IAM identity
  const userId = event.requestContext.identity.cognitoIdentityId;
  if (!userId) {
    throw new Util.ApiError(401, "Unauthorized");
  }

  // Get username from identity id
  const username = userId.split(":")[1] || "Player";

  const game = await GameService.createGame(
    name,
    { id: userId, username },
    settings
  );

  return game;
});
