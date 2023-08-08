import * as z from "zod";
import { CheckboxSchema, IdSchema } from "./misc-validation";
import { TagNameSchema } from "./tag-validation";

export const BookmarkIdSchema = IdSchema;

export const BookmarkUrlSchema = z
  .string({ required_error: "URL is required" })
  .url({ message: "URL is invalid" })
  .startsWith("https://", { message: "URL is insecure, use https" })
  .min(12, { message: "URL is too short" })
  .max(2000, { message: "URL is too long" });

export const BookmarkTitleSchema = z
  .string()
  .min(2, { message: "Title is too short" })
  .max(45, { message: "Title is too long" });

export const BookmarkDescriptionSchema = z
  .string()
  .min(2, { message: "Description is too short" })
  .max(255, { message: "Description is too long" });

export const BookmarkFavoriteSchema = CheckboxSchema;

export const BookmarkTagsSchema = z.array(TagNameSchema);

export const CreateBookmarkFormSchema = z.object({
  url: BookmarkUrlSchema,
  title: BookmarkTitleSchema.optional(),
  description: BookmarkDescriptionSchema.optional(),
  tags: BookmarkTagsSchema.optional(),
});

export const UpdateBookmarkFormSchema = z.object({
  id: BookmarkIdSchema,
  url: BookmarkUrlSchema,
  title: BookmarkTitleSchema.optional(),
  description: BookmarkDescriptionSchema.optional(),
  tags: BookmarkTagsSchema.optional(),
});

