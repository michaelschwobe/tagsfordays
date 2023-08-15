import * as z from "zod";
import { IdSchema } from "~/utils/misc-validation";

export const TagIdSchema = IdSchema;

export const TagNameSchema = z
  .string({ required_error: "Name is required" })
  .min(2, { message: "Name is too short" })
  .max(45, { message: "Name is too long" })
  .regex(/^[a-zA-Z0-9-]+$/, {
    message: "Name can only include letters, numbers, and hyphens",
  })
  .transform((value) => value.toLowerCase());

export const CreateTagFormSchema = z.object({
  name: TagNameSchema,
});

export const UpdateTagFormSchema = z.object({
  id: TagIdSchema,
  name: TagNameSchema,
});
