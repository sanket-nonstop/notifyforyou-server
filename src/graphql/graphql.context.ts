// ==========================================
// FILE: src/graphql/context/graphql.context.ts
// ==========================================
/**
 * GraphQL Context Builder
 * ------------------------
 * - Injects user, session, requestId
 * - Used by all resolvers
 */

import { Request, Response } from "express";

export interface GraphQLContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
}

export const createGraphQLContext = async ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}): Promise<GraphQLContext> => {
  const context: GraphQLContext = {};

  // Add requestId only if it exists (IMPORTANT for exactOptionalPropertyTypes)
  if (request.requestId) {
    context.requestId = request.requestId;
  }

  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) return context;

    // const token = authHeader.replace("Bearer ", "");

    // const payload = verifyAccessToken(token);

    // const session = await SessionModel.findOne({
    //   _id: payload.sessionId,
    //   status: SessionStatus.ACTIVE,
    //   type: AuthSessionType.LOGIN,
    // }).select("_id user expiresAt");

    // if (!session) return context;

    // context.userId = session.user.toString();
    // context.sessionId = session._id.toString();

    context.userId = "Not available";
    context.sessionId = "Not available";
  } catch {
    return context;
  }

  return context;
};
