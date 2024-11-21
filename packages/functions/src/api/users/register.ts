import { Util } from "@bigspella/core/util";
import { User } from "@bigspella/core/user";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
});

export const main = Util.handler(async (event) => {
  const userId = event.requestContext.authorizer?.cognitoIdentityId;
  if (!userId) {
    throw new Util.ApiError(401, "Unauthorized");
  }

  const body = JSON.parse(event.body || "{}");
  const { email, username } = registerSchema.parse(body);

  // Check if user already exists
  const existingUser = await User.getByCognitoId(userId);
  if (existingUser) {
    throw new Util.ApiError(409, "User already exists");
  }

  const user = await User.create(userId, email, username);
  return user;
});
