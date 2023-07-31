import * as z from "zod";

export const TagNameSchema = z
  .string()
  .min(2, { message: "Name is too short" })
  .max(20, { message: "Name is too long" })
  .regex(/^[a-zA-Z0-9-]+$/, {
    message: "Name can only include letters, numbers, and hyphens",
  })
  .transform((value) => value.toLowerCase());
