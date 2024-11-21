import { vpc } from "./vpc";
import { db } from "./database";

// Create realtime server with IoT
export const realtime = new sst.aws.Realtime("GameServer", {
  authorizer: "packages/functions/src/realtime/authorizer.handler",
});

// Subscribe to game events
realtime.subscribe("packages/functions/src/realtime/game.handler", {
  filter: `\${$app.name}/\${$app.stage}/game/#`,
});

// Subscribe to chat events
realtime.subscribe("packages/functions/src/realtime/chat.handler", {
  filter: `\${$app.name}/\${$app.stage}/chat/#`,
});

// Subscribe to tournament events
realtime.subscribe("packages/functions/src/realtime/tournament.handler", {
  filter: `\${$app.name}/\${$app.stage}/tournament/#`,
});

// Subscribe to user presence events
realtime.subscribe("packages/functions/src/realtime/presence.handler", {
  filter: `\${$app.name}/\${$app.stage}/presence/#`,
});
