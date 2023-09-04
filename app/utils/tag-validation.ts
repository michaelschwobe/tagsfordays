import { refine } from "@conform-to/zod";
import * as z from "zod";
import { IdSchema } from "~/utils/misc-validation";

export const TagIdSchema = IdSchema;

export const TagNameSchema = z
  .string({ required_error: "Name is required" })
  .min(2, { message: "Name is too short" })
  .max(45, { message: "Name is too long" })
  .regex(/^[a-zA-Z0-9-.\s]+$/, {
    message: "Name can only include letters, numbers, hyphens, and periods",
  })
  .transform((val) => val.replaceAll(/  +/g, " ").trim());

export function toCreateTagFormSchema(
  intent: string,
  constraints?: {
    isTagNameUnique?: (name: string) => Promise<boolean>;
  },
) {
  return z.object({
    name: TagNameSchema.pipe(
      z.string().superRefine((val, ctx) =>
        refine(ctx, {
          validate: () => constraints?.isTagNameUnique?.(val),
          when: intent === "submit" || intent === "validate/name",
          message: "Name must be unique",
        }),
      ),
    ),
  });
}

export function toUpdateTagFormSchema(
  intent: string,
  constraints?: {
    isTagNameUnique?: (name: string) => Promise<boolean>;
  },
) {
  return z.object({
    id: TagIdSchema,
    name: TagNameSchema.pipe(
      z.string().superRefine((val, ctx) =>
        refine(ctx, {
          validate: () => constraints?.isTagNameUnique?.(val),
          when: intent === "submit" || intent === "validate/name",
          message: "Name must be unique",
        }),
      ),
    ),
  });
}
