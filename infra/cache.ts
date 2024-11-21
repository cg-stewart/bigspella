import { vpc } from "./database";
// Create Redis cluster
export const cache = new sst.aws.Redis("GameCache", {
  vpc,
  engine: "valkey",
  instance: "t4g.micro",
  nodes: 1,
  version: "7.0",
});

// Export cache configuration for use in other components
export const config = {
  host: cache.host,
  port: cache.port,
};
