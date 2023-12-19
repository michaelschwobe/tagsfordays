import type { Book, Bookmark, Tag, User } from "@prisma/client";
import type { BookSearchKey } from "~/utils/book";
import { prisma } from "~/utils/db.server";

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/books.$bookId._index.tsx
 * - `/app/routes/books.$bookId.edit.tsx
 */
export async function getBook({ id }: { id: Book["id"] }) {
  return await prisma.book.findFirst({
    select: {
      id: true,
      title: true,
      content: true,
      favorite: true,
      bookmarks: {
        include: { bookmark: { select: { id: true, url: true, title: true } } },
        orderBy: [
          { bookmark: { createdAt: "desc" } },
          { bookmark: { url: "asc" } },
        ],
      },
      tags: {
        include: { tag: { select: { id: true, name: true } } },
        orderBy: { tag: { name: "asc" } },
      },
    },
    where: { id },
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/books.$bookId.edit.tsx`
 * - `/app/routes/books.new.tsx`
 */
export async function getBookByTitle({ title }: { title: Book["title"] }) {
  return await prisma.book.findUnique({
    select: { id: true },
    where: { title },
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/books/_index.tsx`
 */
export async function getBooks({
  searchKey,
  searchValue,
}: {
  searchKey?: BookSearchKey | null;
  searchValue?: string | null;
} = {}) {
  return await prisma.book.findMany({
    select: {
      id: true,
      title: true,
      content: true,
      favorite: true,
      createdAt: true,
      _count: { select: { bookmarks: true, tags: true } },
    },
    where:
      !!searchValue && searchKey === "bookmarks"
        ? {
            OR: [
              {
                bookmarks: {
                  some: { bookmark: { url: { contains: searchValue } } },
                },
              },
              {
                bookmarks: {
                  some: { bookmark: { title: { contains: searchValue } } },
                },
              },
              {
                bookmarks: {
                  some: { bookmark: { content: { contains: searchValue } } },
                },
              },
            ],
          }
        : !!searchValue && searchKey === "tags"
          ? { tags: { some: { tag: { name: { contains: searchValue } } } } }
          : !!searchValue && !!searchKey
            ? { [searchKey]: { contains: searchValue } }
            : {},
    orderBy:
      !!searchValue && searchKey === "bookmarks"
        ? [
            { bookmarks: { _count: "asc" } },
            { createdAt: "desc" },
            { title: "asc" },
          ]
        : !!searchValue && searchKey === "tags"
          ? [
              { tags: { _count: "asc" } },
              { createdAt: "desc" },
              { title: "asc" },
            ]
          : [{ createdAt: "desc" }, { title: "asc" }],
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/books.new.tsx`
 */
export async function createBook({
  title,
  content,
  favorite,
  bookmarks,
  tags,
  userId,
}: {
  title: Book["title"];
  content: Book["content"];
  favorite: Book["favorite"];
  bookmarks: Bookmark["url"][];
  tags: Tag["name"][];
  userId: User["id"];
}) {
  return await prisma.book.create({
    data: {
      title,
      content,
      favorite,
      bookmarks: {
        create: bookmarks.map((url) => ({
          bookmark: {
            connectOrCreate: {
              where: { url, userId },
              create: { url, userId },
            },
          },
        })),
      },
      tags: {
        create: tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name, userId },
              create: { name, userId },
            },
          },
        })),
      },
      user: { connect: { id: userId } },
    },
    select: { id: true },
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/books.$bookId.edit.tsx`
 */
export async function updateBook({
  id,
  title,
  content,
  favorite,
  bookmarks,
  tags,
  userId,
}: {
  id: Book["id"];
  title: Book["title"];
  content: Book["content"];
  favorite: Book["favorite"];
  bookmarks: Bookmark["url"][];
  tags: Tag["name"][];
  userId: User["id"];
}) {
  return await prisma.book.update({
    data: {
      title,
      content,
      favorite,
      bookmarks: {
        deleteMany: {},
        create: bookmarks.map((url) => ({
          bookmark: {
            connectOrCreate: {
              where: { url, userId },
              create: { url, userId },
            },
          },
        })),
      },
      tags: {
        deleteMany: {},
        create: tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name, userId },
              create: { name, userId },
            },
          },
        })),
      },
    },
    select: { id: true },
    where: { id, userId },
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/books.$bookId.edit.tsx`
 */
export async function favoriteBook({
  id,
  favorite,
  userId,
}: {
  id: Book["id"];
  favorite: Book["favorite"];
  userId: User["id"];
}) {
  return await prisma.book.update({
    data: { favorite },
    select: { id: true },
    where: { id, userId },
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/books.$bookId.edit.tsx`
 */
export async function deleteBook({
  id,
  userId,
}: {
  id: Book["id"];
  userId: User["id"];
}) {
  return await prisma.book.deleteMany({
    where: { id, userId },
  });
}
