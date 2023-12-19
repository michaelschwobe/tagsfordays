import { refine } from "@conform-to/zod";
import * as z from "zod";
import { CheckboxSchema, IdSchema } from "~/utils/misc-validation";
import { TagNameSchema } from "~/utils/tag-validation";

const BookIdSchema = IdSchema;

const BookTitleSchema = z
  .string({ required_error: "Title is required" })
  .min(2, { message: "Title is too short" })
  .max(45, { message: "Title is too long" });

const BookContentSchema = z
  .string()
  .min(2, { message: "Content is too short" })
  .max(255, { message: "Content is too long" });

const BookFavoriteSchema = CheckboxSchema;

const BookBookmarksSchema = z.array(IdSchema);

const BookTagsSchema = z.array(TagNameSchema);

// export const CreateBookFormSchema = z.object({
//   title: BookTitleSchema,
//   content: BookContentSchema.optional(),
//   favorite: BookFavoriteSchema.optional(),
//   bookmarks: BookBookmarksSchema.optional(),
//   tags: BookTagsSchema.optional(),
// });

// export const UpdateBookFormSchema = z.object({
//   id: BookIdSchema,
//   title: BookTitleSchema,
//   content: BookContentSchema.optional(),
//   favorite: BookFavoriteSchema.optional(),
//   bookmarks: BookBookmarksSchema.optional(),
//   tags: BookTagsSchema.optional(),
// });

export function toCreateBookFormSchema(
  intent: string,
  constraints?: {
    isBookTitleUnique?: (title: string) => Promise<boolean>;
  },
) {
  return z.object({
    title: BookTitleSchema.pipe(
      z.string().superRefine((val, ctx) =>
        refine(ctx, {
          validate: () => constraints?.isBookTitleUnique?.(val),
          when: intent === "submit" || intent === "validate/title",
          message: "Title must be unique",
        }),
      ),
    ),
    content: BookContentSchema.optional(),
    favorite: BookFavoriteSchema.optional(),
    bookmarks: BookBookmarksSchema.optional(),
    tags: BookTagsSchema.optional(),
  });
}

export function toUpdateBookFormSchema(
  intent: string,
  constraints?: {
    isBookTitleUnique?: (title: string) => Promise<boolean>;
  },
) {
  return z.object({
    id: BookIdSchema,
    title: BookTitleSchema.pipe(
      z.string().superRefine((val, ctx) =>
        refine(ctx, {
          validate: () => constraints?.isBookTitleUnique?.(val),
          when: intent === "submit" || intent === "validate/title",
          message: "Title must be unique",
        }),
      ),
    ),
    content: BookContentSchema.optional(),
    favorite: BookFavoriteSchema.optional(),
    bookmarks: BookBookmarksSchema.optional(),
    tags: BookTagsSchema.optional(),
  });
}

export const FavoriteBookFormSchema = z.object({
  favorite: BookFavoriteSchema.optional(),
});
