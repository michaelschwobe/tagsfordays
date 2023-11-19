import * as z from "zod";

export const SearchValueSchema = z
  .string()
  .min(1)
  .max(100)
  .nullable()
  .catch(null);

export const SkipSchema = z.coerce.number().int().min(0).nullable().catch(null);

export const TakeSchema = z.coerce.number().int().min(1).nullable().catch(null);
