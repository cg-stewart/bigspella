import { Util } from "@bigspella/core/util";
import { User } from "@bigspella/core/user";

export const main = Util.handler(async (event) => {
  const userId = event.requestContext.authorizer?.cognitoIdentityId;
  if (!userId) {
    throw new Util.ApiError(401, "Unauthorized");
  }

  // Get user by Cognito ID
  const user = await User.getByCognitoId(userId);
  if (!user) {
    throw new Util.ApiError(404, "User not found");
  }

  if (event.httpMethod === "GET") {
    return user;
  }

  if (event.httpMethod === "PUT") {
    const body = JSON.parse(event.body || "{}");
    const updatedUser = await User.update(user.id, body);
    return updatedUser;
  }

  throw new Util.ApiError(405, "Method not allowed");
});
