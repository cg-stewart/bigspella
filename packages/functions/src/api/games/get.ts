import { APIGatewayProxyEventV2, Context } from "aws-lambda";
import { db } from "@bigspella/core/db";
import { games } from "@bigspella/core/db/schema/game.sql";
import { Util } from "@bigspella/core/util";
import { eq } from "drizzle-orm";

export const handler = Util.handler(async (event) => {
  const gameId = event.pathParameters?.id;
  if (!gameId) {
    throw new Util.ApiError(400, "Game ID is required");
  }

  const game = await db.query.games.findFirst({
    where: eq(games.id, gameId),
  });

  if (!game) {
    throw new Util.ApiError(404, "Game not found");
  }

  return {
    statusCode: 200,
    body: JSON.stringify(game),
  };
});
