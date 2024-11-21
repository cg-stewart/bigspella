// Create S3 bucket for audio files
export const audioBucket = new sst.aws.Bucket("AudioStorage", {
  // Configure CORS for browser uploads
  cors: {
    allowMethods: ["GET", "PUT"],
    allowOrigins: ["*"],
    allowHeaders: ["*"],
    maxAge: "1 day",
  },

  // Configure bucket for public access
  public: true,
  // Configure caching
});

// Create CloudFront distribution for audio files
/*export const audioDistribution = new sst.aws.Distribution("AudioDistribution", {
  domain:
    $app.stage === "prod"
      ? "audio.bigspella.com"
      : `audio-${$app.stage}.bigspella.com`,
  defaults: {
    origin: audioBucket,
    // Configure caching behavior
    behavior: {
      allowedMethods: ["GET", "HEAD", "OPTIONS"],
      compress: true,
      cachePolicy: {
        // Cache based on query strings and headers
        queryStringBehavior: "all",
        headerBehavior: "whitelist",
        headers: ["Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"],
        // TTL settings
        minTtl: "1 minute",
        maxTtl: "1 day",
        defaultTtl: "1 hour",
      },
    },
  },
});*/
