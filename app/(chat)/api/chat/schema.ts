import { z } from 'zod';

const textPartSchema = z.object({
  text: z.string().min(1).max(2000),
  type: z.enum(['text']),
});

export const postRequestBodySchema = z.object({
  id: z.string().uuid(),
  message: z.object({
    id: z.string().uuid(),
    createdAt: z.coerce.date(),
    role: z.enum(['user']),
    content: z.string().min(1).max(2000),
    parts: z.array(textPartSchema),
    experimental_attachments: z
      .array(
        z.object({
          url: z.string().url(),
          name: z.string().min(1).max(2000),
          contentType: z.enum(['image/png', 'image/jpg', 'image/jpeg']),
        }),
      )
      .optional(),
  }),
  selectedChatModel: z.string()
    .refine(
      (val) => {
        // Allow standard models
        if (val === 'chat-english-prompt' || val === 'chat-model' || val === 'chat-model-reasoning') {
          return true;
        }
        // Allow custom models that start with 'custom-'
        if (val.startsWith('custom-')) {
          return true;
        }
        return false;
      }, 
      { message: "Must be a valid model ID (standard model or custom model starting with 'custom-')" }
    ),
  selectedVisibilityType: z.enum(['public', 'private']),
});

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
