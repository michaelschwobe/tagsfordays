import { refine } from "@conform-to/zod";
import * as z from "zod";
import { CheckboxSchema, IdSchema, UrlSchema } from "~/utils/misc-validation";
import { TagNameSchema } from "~/utils/tag-validation";

const BookmarkIdSchema = IdSchema;

const BookmarkUrlSchema = UrlSchema.min(12, {
  message: "URL is too short",
}).max(2000, { message: "URL is too long" });

const BookmarkTitleSchema = z
  .string()
  .min(2, { message: "Title is too short" })
  .max(45, { message: "Title is too long" });

const BookmarkContentSchema = z
  .string()
  .min(2, { message: "Content is too short" })
  .max(255, { message: "Content is too long" });

const BookmarkFavoriteSchema = CheckboxSchema;

const BookmarkTagsSchema = z.array(TagNameSchema);

const BookmarkFilesSchema = z
  .array(z.instanceof(File))
  .min(1, "At least 1 file is required")
  .refine(
    (files) => files.every((file) => file.type === "text/html"),
    "File must be of type text/html",
  )
  .refine(
    (files) => files.every((file) => file.size < 500_000),
    "File size must be less than 500kB",
  );

export const UploadBookmarkFilesSchema = z.object({
  files: BookmarkFilesSchema,
});

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
