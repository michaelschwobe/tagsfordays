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

export const TagNamesSchema = z
  .string({ required_error: "Name is required" })
  .min(2, { message: "Name is too short" })
  .transform((val, ctx) => {
    const valList = val
      .split(",")
      .map((tag) => tag.replaceAll(/  +/g, " ").trim())
      .filter(Boolean);

    if (valList.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 1,
        type: "array",
        inclusive: true,
        message: "Name is required",
        fatal: true,
      });
      return z.NEVER;
    }
    if (valList.length !== new Set(valList).size) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Name must be unique",
        fatal: true,
      });
      return z.NEVER;
    }

    for (const valListItem of valList) {
      if (valListItem.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 2,
          type: "string",
          inclusive: true,
          message: "Name is too short",
        });
      }
      if (valListItem.length > 45) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: 45,
          type: "string",
          inclusive: true,
          message: "Name is too long",
        });
      }
      if (!/^[a-zA-Z0-9-.\s]+$/.test(valListItem)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Name can only include letters, numbers, hyphens, and periods",
        });
      }
    }

    return valList.join(",");
  });

export function toCreateTagFormSchema(
  intent: string,
  constraints?: {
    isTagNameUnique?: (names: string) => Promise<boolean>;
  },
) {
  return z.object({
    name: TagNamesSchema.pipe(
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
