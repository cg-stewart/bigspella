import { Context, APIGatewayProxyEvent } from "aws-lambda";

export module Util {
  export function handler(
    lambda: (evt: APIGatewayProxyEvent, context: Context) => Promise<any>
  ) {
    return async function (event: APIGatewayProxyEvent, context: Context) {
      let body: string, statusCode: number;

      try {
        // Run the Lambda
        const response = await lambda(event, context);
        body = JSON.stringify(response);
        statusCode = 200;
      } catch (error) {
        statusCode = error instanceof Util.ApiError ? error.statusCode : 500;
        body = JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
        });
      }

      return {
        statusCode,
        body,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
      };
    };
  }

  export class ApiError extends Error {
    constructor(public statusCode: number, message: string) {
      super(message);
      this.name = "ApiError";
    }
  }
}
