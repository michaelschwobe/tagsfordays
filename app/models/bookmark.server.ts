import type { Bookmark, Tag, User } from "@prisma/client";
import type { BookmarkSearchKey } from "~/utils/bookmark";
import { prisma } from "~/utils/db.server";

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/bookmarks.$bookmarkId._index.tsx`
 * - `/app/routes/bookmarks.$bookmarkId.edit.tsx`
 */
export async function getBookmark({ id }: { id: Bookmark["id"] }) {
  return await prisma.bookmark.findFirst({
    select: {
      id: true,
      url: true,
      title: true,
      content: true,
      favorite: true,
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
 * - `/app/routes/bookmarks.$bookmarkId.edit.tsx`
 * - `/app/routes/bookmarks.new.tsx`
 */
export async function getBookmarkByUrl({ url }: { url: Bookmark["url"] }) {
  return await prisma.bookmark.findUnique({
    select: { id: true },
    where: { url },
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/bookmarks/_index.tsx`
 */
export async function getBookmarks({
  searchKey,
  searchValue,
}: {
  searchKey?: BookmarkSearchKey | null;
  searchValue?: string | null;
} = {}) {
  return await prisma.bookmark.findMany({
    select: {
      id: true,
      url: true,
      title: true,
      favorite: true,
      createdAt: true,
      _count: { select: { tags: true } },
    },
    where:
      !!searchValue && searchKey === "tags"
        ? { tags: { some: { tag: { name: { contains: searchValue } } } } }
        : !!searchValue && !!searchKey
          ? { [searchKey]: { contains: searchValue } }
          : {},
    orderBy:
      !!searchValue && searchKey === "tags"
        ? [{ tags: { _count: "asc" } }, { createdAt: "desc" }, { title: "asc" }]
        : [{ createdAt: "desc" }, { title: "asc" }],
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/bookmarks.status.tsx`
 */
export async function getBookmarksCount() {
  return await prisma.bookmark.count();
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/utils/bookmark-exports.server.ts`
 */
export async function getBookmarksExport() {
  return await prisma.bookmark.findMany({
    select: { id: true, url: true, title: true, createdAt: true },
    orderBy: [{ createdAt: "desc" }, { title: "asc" }],
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/_index.tsx`
 */
export async function getBookmarksLatest({ take = 3 }: { take?: number } = {}) {
  return await prisma.bookmark.findMany({
    select: { id: true, url: true, title: true },
    orderBy: [{ createdAt: "desc" }, { title: "asc" }],
    take,
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/bookmarks.status.tsx`
 */
export async function getBookmarksStatus({
  skip,
  take,
}: {
  skip?: number | null;
  take?: number | null;
} = {}) {
  return await prisma.bookmark.findMany({
    select: { id: true, url: true },
    orderBy: [{ createdAt: "desc" }, { url: "asc" }],
    ...(take ? { take } : {}),
    ...(skip ? { skip } : {}),
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/bookmarks.new.tsx`
 */
export async function createBookmark({
  url,
  title,
  content,
  favorite,
  tags,
  userId,
}: {
  url: Bookmark["url"];
  title: Bookmark["title"];
  content: Bookmark["content"];
  favorite: Bookmark["favorite"];
  tags: Tag["name"][];
  userId: User["id"];
}) {
  return await prisma.bookmark.create({
    data: {
      url,
      title,
      content,
      favorite,
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
 * - `/app/routes/bookmarks.import.tsx`
 */
export async function importBookmark({
  url,
  title,
  createdAt,
  userId,
}: {
  url: Bookmark["url"];
  title: Bookmark["title"];
  createdAt: Bookmark["createdAt"];
  userId: User["id"];
}) {
  return await prisma.bookmark.create({
    data: {
      url,
      title,
      createdAt,
      user: { connect: { id: userId } },
    },
    select: { id: true },
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/bookmarks.$bookmarkId.edit.tsx`
 */
export async function updateBookmark({
  id,
  url,
  title,
  content,
  favorite,
  tags,
  userId,
}: {
  id: Bookmark["id"];
  url: Bookmark["url"];
  title: Bookmark["title"];
  content: Bookmark["content"];
  favorite: Bookmark["favorite"];
  tags: Tag["name"][];
  userId: User["id"];
}) {
  return await prisma.bookmark.update({
    data: {
      url,
      title,
      content,
      favorite,
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
 * - `/app/routes/bookmarks.$bookmarkId.edit.tsx`
 */
export async function favoriteBookmark({
  id,
  favorite,
  userId,
}: {
  id: Bookmark["id"];
  favorite: Bookmark["favorite"];
  userId: User["id"];
}) {
  return await prisma.bookmark.update({
    data: { favorite },
    select: {},
    where: { id, userId },
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/bookmarks.$bookmarkId.edit.tsx`
 */
export async function deleteBookmark({
  id,
  userId,
}: {
  id: Bookmark["id"];
  userId: User["id"];
}) {
  return await prisma.bookmark.deleteMany({
    where: { id, userId },
  });
}
