import { refine } from "@conform-to/zod";
import * as z from "zod";
import { CheckboxSchema, IdSchema, UrlSchema } from "~/utils/misc-validation";
import { TagNameSchema } from "~/utils/tag-validation";

export const BookmarkIdSchema = IdSchema;

export const BookmarkUrlSchema = UrlSchema.min(12, {
  message: "URL is too short",
}).max(2000, { message: "URL is too long" });

export const BookmarkTitleSchema = z
  .string()
  .min(2, { message: "Title is too short" })
  .max(45, { message: "Title is too long" });

export const BookmarkContentSchema = z
  .string()
  .min(2, { message: "Content is too short" })
  .max(255, { message: "Content is too long" });

export const BookmarkFavoriteSchema = CheckboxSchema;

export const BookmarkTagsSchema = z.array(TagNameSchema);

export function toCreateBookmarkFormSchema(
  intent: string,
  constraints?: {
    isBookmarkUrlUnique?: (url: string) => Promise<boolean>;
  },
) {
  return z.object({
    url: BookmarkUrlSchema.pipe(
      z.string().superRefine((val, ctx) =>
        refine(ctx, {
          validate: () => constraints?.isBookmarkUrlUnique?.(val),
          when: intent === "submit" || intent === "validate/url",
          message: "URL must be unique",
        }),
      ),
    ),
    title: BookmarkTitleSchema.optional(),
    content: BookmarkContentSchema.optional(),
    favorite: BookmarkFavoriteSchema.optional(),
    tags: BookmarkTagsSchema.optional(),
  });
}

export function toUpdateBookmarkFormSchema(
  intent: string,
  constraints?: {
    isBookmarkUrlUnique?: (url: string) => Promise<boolean>;
  },
) {
  return z.object({
    id: BookmarkIdSchema,
    url: BookmarkUrlSchema.pipe(
      z.string().superRefine((val, ctx) =>
        refine(ctx, {
          validate: () => constraints?.isBookmarkUrlUnique?.(val),
          when: intent === "submit" || intent === "validate/url",
          message: "URL must be unique",
        }),
      ),
    ),
    title: BookmarkTitleSchema.optional(),
    content: BookmarkContentSchema.optional(),
    favorite: BookmarkFavoriteSchema.optional(),
    tags: BookmarkTagsSchema.optional(),
  });
}

export const FavoriteBookmarkFormSchema = z.object({
  favorite: BookmarkFavoriteSchema.optional(),
});
