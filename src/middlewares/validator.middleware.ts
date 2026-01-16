import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

type ValidationSchema = {
  body?: any;
  query?: any;
  params?: any;
};

export const validatorMiddleware =
  (schema: any | ValidationSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // ✅ If you pass direct z.object(...) -> validate body
      if ("safeParse" in schema) {
        req.body = schema.parse(req.body || {});
        return next();
      }

      // ✅ If you pass { body, query, params } -> validate accordingly
      if (schema.body) req.body = schema.body.parse(req.body || {});
      if (schema.query) req.query = schema.query.parse(req.query);
      if (schema.params) req.params = schema.params.parse(req.params);

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formatted: Record<string, string> = {};

        for (const issue of error.issues) {
          const field = issue.path.join(".");
          if (!formatted[field]) formatted[field] = issue.message;
        }

        const errorArray = Object.entries(formatted).map(([path, message]) => ({
          path,
          message,
        }));

        return res.status(400).json({
          success: false,
          message: "Invalid request data",
          errors: errorArray,
        });
      }

      return next(error);
    }
  };
