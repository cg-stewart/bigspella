import { audioBucket } from "./storage";
import { api } from "./api";

const region = aws.getRegionOutput().name;

// Create Cognito User Pool
export const userPool = new sst.aws.CognitoUserPool("UserPool", {
  // Allow sign in with email
  usernames: ["email"],
  // Allow sign in with email and phone number

  // Configure triggers for customization
  triggers: {
    // Customize verification messages
    customMessage: "packages/functions/src/auth/customMessage.handler",
    // Post authentication hook for tracking/analytics
    postAuthentication:
      "packages/functions/src/auth/postAuthentication.handler",
    // Post confirmation hook for user setup
    postConfirmation: "packages/functions/src/auth/postConfirmation.handler",
  },
});

export const userPoolClient = userPool.addClient("UserPoolClient");

// Add web client
export const identityPool = new sst.aws.CognitoIdentityPool("IdentityPool", {
  userPools: [
    {
      userPool: userPool.id,
      client: userPoolClient.id,
    },
  ],
  permissions: {
    authenticated: [
      {
        actions: ["s3:*"],
        resources: [
          $concat(
            audioBucket.arn,
            "/private/${cognito-identity.amazonaws.com:sub}/*"
          ),
        ],
      },
      {
        actions: ["execute-api:*"],
        resources: [
          $concat(
            "arn:aws:execute-api:",
            region,
            ":",
            aws.getCallerIdentityOutput({}).accountId,
            ":",
            api.nodes.api.id,
            "/*/*/*"
          ),
        ],
      },
    ],
  },
});
