# 🛡️ End-to-End Zod Validation Guide

The monorepo implements a unified, end-to-end data validation architecture: centralized Zod schemas in `@snake/types` are shared across frontend forms and backend Express API middlewares.

---

## Key Benefits
1. **DRY (Don't Repeat Yourself)**: Validation schemas are written once.
2. **Type Safety**: TypeScript models are automatically derived via `z.infer<typeof schema>`.
3. **Consistent Error Handling**: Uniform validation error messages across client-side UI and API `400 Bad Request` responses.

---

## 1. Schema Definition in `@snake/types`

```typescript
// packages/types/src/index.ts
import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string({ error: 'Title is required' }).min(1, 'Title is required').trim(),
  description: z.string().optional().default(''),
});

export type CreateTaskPayload = z.infer<typeof createTaskSchema>;
```

---

## 2. Frontend Usage (React Hook Form)

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@snake/types';

const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
  resolver: zodResolver(registerSchema),
});
```

---

## 3. Backend Usage (Express Middleware)

```typescript
import { Router } from 'express';
import { createTaskSchema } from '@snake/types';
import { validateRequestBody } from '../middlewares/validate.middleware';
import { createTaskHandler } from '../controllers/task.controller';

const taskRouter = Router();
taskRouter.post('/', validateRequestBody(createTaskSchema), createTaskHandler);
```
