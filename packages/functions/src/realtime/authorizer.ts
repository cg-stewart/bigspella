import { Resource } from "sst";
import { realtime } from "sst/aws/realtime";

export const handler = realtime.authorizer(async (token) => {
  // TODO: Validate the token with Cognito or custom auth logic

  // Get app and stage prefix for topics
  const prefix = `${Resource.App.name}/${Resource.App.stage}`;

  return {
    // Set connection timeout to 24 hours
    disconnectAfterInSeconds: 86400,
    // Refresh policy every hour
    refreshAfterInSeconds: 3600,
    // Allow subscribing to all game, chat, tournament, and presence topics
    subscribe: [
      `${prefix}/game/#`,
      `${prefix}/chat/#`,
      `${prefix}/tournament/#`,
      `${prefix}/presence/#`,
    ],
    // Allow publishing to specific topics based on user role
    publish: [
      `${prefix}/game/+/answer`,
      `${prefix}/game/+/ready`,
      `${prefix}/chat/+/message`,
      `${prefix}/presence/+/status`,
    ],
    // Set principal ID (will be implemented with actual user ID)
    principalId: "temp-user-id",
  };
});
