import { db, vpc } from "./database";
import { cache } from "./cache";
import { api, dictionaryApiKey, thesaurusApiKey } from "./api";
import { realtime } from "./realtime";

// Create a linkable resource that combines all our messaging infrastructure
export const messaging = new sst.Linkable("Messaging", {
  properties: {
    // Database
    database: {
      host: db.host,
      port: db.port,
      username: db.username,
      password: db.password,
      database: db.database,
    },
    // Cache
    cache: {
      host: cache.host,
      port: cache.port,
      username: cache.username,
      password: cache.password,
    },
    // API Keys
    keys: {
      dictionary: dictionaryApiKey.value,
      thesaurus: thesaurusApiKey.value,
    },
    // API and WebSocket endpoints
    endpoints: {
      http: api.url,
      ws: realtime.endpoint,
    },
  },
  include: [
    // Database permissions
    sst.aws.permission({
      actions: ["rds:*"],
      resources: [db.urn],
    }),
    // Cache permissions
    sst.aws.permission({
      actions: ["elasticache:*"],
      resources: [cache.nodes.cluster.arn],
    }),
    // API Gateway permissions
    sst.aws.permission({
      actions: ["execute-api:*"],
      resources: [api.arn, realtime.nodes.authorizer.arn],
    }),
  ],
});
