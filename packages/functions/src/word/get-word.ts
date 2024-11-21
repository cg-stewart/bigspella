import { APIGatewayProxyEvent } from "aws-lambda";
import { Util } from "@bigspella/core/util";
import { WordService } from "@bigspella/core/word";
import { Resource } from "sst";

export const handler = Util.handler(async (event: APIGatewayProxyEvent) => {
  try {
    const userId = event.requestContext.identity.cognitoIdentityId;
    if (!userId) {
      throw new Util.ApiError(401, "Unauthorized");
    }

    const difficulty =
      (event.queryStringParameters
        ?.difficulty as WordService.DifficultyLevel) || "MEDIUM";

    try {
      const word = await WordService.getRandomWord(
        difficulty,
        Resource.DictionaryApiKey.value,
        Resource.ThesaurusApiKey.value
      );

      return {
        statusCode: 200,
        body: JSON.stringify(word),
      };
    } catch (error) {
      console.error("Error getting word:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to get word" }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
});
