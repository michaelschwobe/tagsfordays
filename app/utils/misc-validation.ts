import * as z from "zod";

export const IdSchema = z.string({ required_error: "Id is required" });

export const CheckboxSchema = z.preprocess(
  (value) => value === "on" || value === "true" || value === true,
  z.boolean(),
);

export const UrlSchema = z
  .string({ required_error: "URL is required" })
  .url({ message: "URL is invalid" })
  .startsWith("https://", { message: "URL is insecure, use https" });
