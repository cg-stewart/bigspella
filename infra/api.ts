import { db, vpc } from "./database";
import { messaging } from "./messaging";

// Create API keys as secrets
export const openaiApiKey = new sst.Secret("OpenAIKey");
export const dictionaryApiKey = new sst.Secret("DictionaryApiKey");
export const thesaurusApiKey = new sst.Secret("ThesaurusApiKey");

// Configure domain based on stage
const domain =
  $app.stage === "prod"
    ? "api.bigspella.com"
    : `api-${$app.stage}.bigspella.com`;

// Create API Gateway v2 HTTP API
export const api = new sst.aws.ApiGatewayV2("API", {
  domain,
  accessLog: {
    retention: "1 month",
  },
  vpc,
  transform: {
    route: {
      handler: {
        link: [openaiApiKey, dictionaryApiKey, thesaurusApiKey, db, messaging],
      },
      args: {
        auth: { iam: true },
      },
    },
  },
});

// User routes
api.route(
  "POST /users/register",
  "packages/functions/src/api/users/register.main"
);
api.route("GET /users/me", "packages/functions/src/api/users/me.main");
api.route("PUT /users/me", "packages/functions/src/api/users/me.main");

// Game routes
api.route("GET /games", "packages/functions/src/api/games/list.main");
api.route("POST /games", "packages/functions/src/api/games/create.main");
api.route("GET /games/{id}", "packages/functions/src/api/games/get.main");
api.route(
  "POST /games/{id}/join",
  "packages/functions/src/api/games/join.main"
);
api.route(
  "POST /games/{id}/ready",
  "packages/functions/src/api/games/ready.main"
);
api.route(
  "POST /games/{id}/start",
  "packages/functions/src/api/games/start.main"
);

// Tournament routes
api.route(
  "GET /tournaments",
  "packages/functions/src/api/tournaments/list.main"
);
api.route(
  "POST /tournaments",
  "packages/functions/src/api/tournaments/create.main"
);
api.route(
  "GET /tournaments/{id}",
  "packages/functions/src/api/tournaments/get.main"
);

// Word routes
api.route("GET /word", "packages/functions/src/word/get-word.main");

// Room routes
api.route("POST /room", "packages/functions/src/room/create-room.main");
