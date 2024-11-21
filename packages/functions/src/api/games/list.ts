import { db } from "@bigspella/core/db/drizzle";
import { games } from "@bigspella/core/db/schema/game.sql";
import { Util } from "@bigspella/core/util";
import { eq } from "drizzle-orm";

export const handler = Util.handler(async (event) => {
  const userId = event.requestContext.authorizer?.cognitoIdentityId;
  if (!userId) {
    throw new Util.ApiError(401, "Unauthorized");
  }

  // Get all games in LOBBY state
  const availableGames = await db.query.games.findMany({
    where: eq(games.state, "LOBBY"),
  });

  return {
    statusCode: 200,
    body: JSON.stringify(availableGames),
  };
});
