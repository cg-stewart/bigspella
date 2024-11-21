import { Util } from "@bigspella/core/util";
import { GameService } from "@bigspella/core/game";

export const handler = Util.handler(async (event) => {
  const gameId = event.pathParameters?.id;
  if (!gameId) {
    throw new Util.ApiError(400, "Game ID is required");
  }

  const userId = event.requestContext.authorizer?.cognitoIdentityId;
  if (!userId) {
    throw new Util.ApiError(401, "Unauthorized");
  }

  // Get username from identity id
  const username = userId.split(":")[1] || "Player";

  const game = await GameService.addPlayer(gameId, { id: userId, username });

  return {
    statusCode: 200,
    body: JSON.stringify(game),
  };
});
