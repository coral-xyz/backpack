import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
export const bodyValidator = (schema: z.ZodObject<{}>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req);
      next();
    } catch (err) {
      next(err);
    }
  };
};
