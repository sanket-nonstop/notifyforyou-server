import { testResolvers } from "./test.resolver";

export const resolvers = {
  Query: {
    health: () => {
      return "GraphQL server is healthy 🚀";
    },
    ...testResolvers.Query,
  },
  Mutation: {
    ...testResolvers.Mutation,
  },
};
