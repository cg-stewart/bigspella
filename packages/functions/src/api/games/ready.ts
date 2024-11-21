import { Util } from "@bigspella/core/util";
import { GameService } from "@bigspella/core/game";
import { z } from "zod";

const readySchema = z.object({
  ready: z.boolean(),
});

export const handler = Util.handler(async (event) => {
  const gameId = event.pathParameters?.id;
  if (!gameId) {
    throw new Util.ApiError(400, "Game ID is required");
  }

  const userId = event.requestContext.authorizer?.cognitoIdentityId;
  if (!userId) {
    throw new Util.ApiError(401, "Unauthorized");
  }

  const body = JSON.parse(event.body || "{}");
  const { ready } = readySchema.parse(body);

  const game = await GameService.updatePlayerReady(gameId, userId, ready);
  return {
    statusCode: 200,
    body: JSON.stringify(game),
  };
});
