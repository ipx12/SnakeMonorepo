import { zValidator } from '@hono/zod-validator';

export const validateRequestBody = (schema: any) => {
  return zValidator('json', schema, (result, c) => {
    if (!result.success) {
      return c.json({ message: result.error.issues[0].message }, 400);
    }
  });
};

export const validateRequestParams = (schema: any) => {
  return zValidator('param', schema, (result, c) => {
    if (!result.success) {
      return c.json({ message: result.error.issues[0].message }, 400);
    }
  });
};

export const validateRequestQuery = (schema: any) => {
  return zValidator('query', schema, (result, c) => {
    if (!result.success) {
      return c.json({ message: result.error.issues[0].message }, 400);
    }
  });
};
