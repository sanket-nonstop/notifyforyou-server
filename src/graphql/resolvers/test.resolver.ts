import { GraphQLContext } from "@graphql/graphql.context";

export const testResolvers = {
  Query: {
    meTest: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      // TEMP: replace with userService later
      return {
        id: "7hjnfj",
        username: "test_user",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        bio: "This is a test profile",
      };
    },
  },

  Mutation: {
    updateProfileTest: async (
      _: unknown,
      {
        input,
      }: { input: { firstName?: string; lastName?: string; bio?: string } },
      ctx: GraphQLContext
    ) => {
      if (!ctx.userId) throw new Error("UNAUTHENTICATED");

      // TEMP: replace with userService later
      return {
        id: "7hjnfj",
        username: "test_user",
        email: "test@example.com",
        firstName: input.firstName ?? "Test",
        lastName: input.lastName ?? "User",
        bio: input.bio ?? "This is a test profile",
      };
    },
  },
};
