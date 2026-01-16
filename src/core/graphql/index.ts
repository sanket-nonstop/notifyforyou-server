// ==========================================
// FILE: src/core/graphql.ts
// ==========================================
/**
 * GraphQL Server Bootstrap (Production-grade)
 * ---------------------------------------------
 * - Single GraphQL endpoint for logged-in APIs
 * - Authenticated context
 * - Centralized error handling
 * - Schema-first approach
 */

import express, { Express } from "express";
import path from "path";

import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { expressMiddleware } from "@as-integrations/express5";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchemaSync } from "@graphql-tools/load";
import { makeExecutableSchema } from "@graphql-tools/schema";

import { graphqlConfig } from "@config/index";
import { createGraphQLContext } from "@graphql/graphql.context";
import { resolvers } from "@graphql/resolvers";
import { logger } from "@logger/index";

export const applyGraphQL = async (app: Express): Promise<void> => {
  if (!graphqlConfig.ENABLED) {
    logger.warn("⚠️ GraphQL is disabled via environment flag");
    return;
  }

  const typeDefs = loadSchemaSync(
    path.join(process.cwd(), "src/graphql/schema/**/*.graphql"),
    { loaders: [new GraphQLFileLoader()] }
  );

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const server = new ApolloServer({
    schema,
    csrfPrevention: false,
    introspection: graphqlConfig.INTROSPECTION, // enable playground
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({
        embed: true,
      }),
    ],
  });

  await server.start();

  app.use(
    graphqlConfig.ENDPOINT,
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) =>
        createGraphQLContext({ request: req, response: res }),
    })
  );

  logger.info(`✅ GraphQL server mounted at ${graphqlConfig.ENDPOINT}`);
};
