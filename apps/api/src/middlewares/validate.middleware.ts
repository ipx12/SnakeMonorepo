import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodSchema } from 'zod';

export const validateRequestBody = (schema: ZodSchema) => {
  return async (httpRequest: Request, httpResponse: Response, nextMiddleware: NextFunction) => {
    try {
      httpRequest.body = await schema.parseAsync(httpRequest.body);
      nextMiddleware();
    } catch (caughtError) {
      if (caughtError instanceof ZodError) {
        const validationErrorMessage = caughtError.issues.map((issue) => issue.message).join(', ');
        return httpResponse.status(400).json({
          message: validationErrorMessage || 'Invalid request payload',
          errors: caughtError.issues,
        });
      }
      nextMiddleware(caughtError);
    }
  };
};

export const validateRequestQuery = (schema: ZodSchema) => {
  return async (httpRequest: Request, httpResponse: Response, nextMiddleware: NextFunction) => {
    try {
      httpRequest.query = await schema.parseAsync(httpRequest.query) as any;
      nextMiddleware();
    } catch (caughtError) {
      if (caughtError instanceof ZodError) {
        const validationErrorMessage = caughtError.issues.map((issue) => issue.message).join(', ');
        return httpResponse.status(400).json({
          message: validationErrorMessage || 'Invalid query parameters',
          errors: caughtError.issues,
        });
      }
      nextMiddleware(caughtError);
    }
  };
};

export const validateRequestParams = (schema: ZodSchema) => {
  return async (httpRequest: Request, httpResponse: Response, nextMiddleware: NextFunction) => {
    try {
      httpRequest.params = await schema.parseAsync(httpRequest.params) as any;
      nextMiddleware();
    } catch (caughtError) {
      if (caughtError instanceof ZodError) {
        const validationErrorMessage = caughtError.issues.map((issue) => issue.message).join(', ');
        return httpResponse.status(400).json({
          message: validationErrorMessage || 'Invalid path parameters',
          errors: caughtError.issues,
        });
      }
      nextMiddleware(caughtError);
    }
  };
};
