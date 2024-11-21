export const vpc = new sst.aws.Vpc("Network", {
  bastion: true,
  nat: "ec2",
});

// Main database instance
export const db = new sst.aws.Postgres("BigSpellaDB", {
  vpc,
  proxy: true,

  database: "bigspella",
  instance: "t4g.micro",
  storage: "20 GB",
  version: "16.4",
});

new sst.x.DevCommand("Studio", {
  link: [db],
  dev: {
    command: "npx drizzle-kit studio",
  },
});

// Configure domain based on stage
const domain =
  $app.stage === "prod"
    ? "api.bigspella.com"
    : `api-${$app.stage}.bigspella.com`;

// Export database configuration
export const config = {
  host: db.host,
  port: db.port,
  username: db.username,
  password: db.password,
  database: db.database,
  domain,
};
