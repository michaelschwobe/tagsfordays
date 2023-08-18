import * as z from "zod";

export const IdSchema = z.string({ required_error: "Id is required" });

export const CheckboxSchema = z
  .string()
  .transform((value) => value === "on" || value === "true" || value === "yes");

export const UrlSchema = z
  .string({ required_error: "URL is required" })
  .url({ message: "URL is invalid" })
  .startsWith("https://", { message: "URL is insecure, use https" });

export function toSearchFormSchema(searchKeys: Parameters<typeof z.enum>[0]) {
  return z.object({
    searchKey: z.enum(searchKeys, {
      required_error: "Search key is required",
      invalid_type_error: "Search key is invalid",
    }),
    searchValue: z
      .string({ required_error: "Search term is required" })
      .min(2, { message: "Search term is too short" })
      .max(45, { message: "Search term is too long" }),
  });
}
