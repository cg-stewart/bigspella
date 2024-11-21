import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { GameService } from "@bigspella/core/game";
import { Util } from "@bigspella/core/util";

export const handler = Util.handler(async (event: APIGatewayProxyEvent, context: Context) => {
  const gameId = event.pathParameters?.id;
  if (!gameId) {
    throw new Util.ApiError(400, "Game ID is required");
  }

  const userId = event.requestContext.authorizer?.cognitoIdentityId;
  if (!userId) {
    throw new Util.ApiError(401, "Unauthorized");
  }

  const game = await GameService.startGame(gameId);
  return game;
});
