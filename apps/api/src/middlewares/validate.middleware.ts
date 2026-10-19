import { zValidator } from '@hono/zod-validator';
import type { ZodSchema } from 'zod';

/**
 * Middleware factory validating JSON request body against a Zod schema.
 * Returns a 400 response with the first validation error message upon failure.
 *
 * @param schema - Zod schema to validate the JSON payload against
 * @returns Hono middleware handler
 */
export const validateRequestBody = (schema: ZodSchema) => {
  return zValidator('json', schema, (result, c) => {
    if (!result.success) {
      return c.json({ message: result.error.issues[0].message }, 400);
    }
  });
};

/**
 * Middleware factory validating route parameters against a Zod schema.
 * Returns a 400 response with the first validation error message upon failure.
 *
 * @param schema - Zod schema to validate route parameters against
 * @returns Hono middleware handler
 */
export const validateRequestParams = (schema: ZodSchema) => {
  return zValidator('param', schema, (result, c) => {
    if (!result.success) {
      return c.json({ message: result.error.issues[0].message }, 400);
    }
  });
};

/**
 * Middleware factory validating URL query parameters against a Zod schema.
 * Returns a 400 response with the first validation error message upon failure.
 *
 * @param schema - Zod schema to validate query parameters against
 * @returns Hono middleware handler
 */
export const validateRequestQuery = (schema: ZodSchema) => {
  return zValidator('query', schema, (result, c) => {
    if (!result.success) {
      return c.json({ message: result.error.issues[0].message }, 400);
    }
  });
};
