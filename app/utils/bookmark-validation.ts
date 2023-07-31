import * as z from "zod";

export const BookmarkUrlSchema = z
  .string()
  .url()
  .startsWith("https://", { message: "URL is insecure, use https" })
  .min(3, { message: "URL is too short" })
  .max(60, { message: "URL is too long" });

export const BookmarkTitleSchema = z
  .string()
  .min(3, { message: "Title is too short" })
  .max(60, { message: "Title is too long" });

export const BookmarkDescriptionSchema = z
  .string()
  .min(3, { message: "Description is too short" })
  .max(160, { message: "Description is too long" });
