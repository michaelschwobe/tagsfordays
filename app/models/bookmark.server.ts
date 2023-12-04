import type { Bookmark, Tag, User } from "@prisma/client";
import type { BookmarkSearchKey } from "~/utils/bookmark";
import { prisma } from "~/utils/db.server";

export async function getBookmark({ id }: Pick<Bookmark, "id">) {
  return prisma.bookmark.findFirst({
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

export async function getBookmarkId({ url }: Pick<Bookmark, "url">) {
  return prisma.bookmark.findUnique({
    select: { id: true },
    where: { url },
  });
}

export async function getBookmarks({
  searchKey,
  searchValue,
  cursorId,
  skip,
  take,
}: {
  searchKey?: BookmarkSearchKey | null;
  searchValue?: string | null;
  cursorId?: Bookmark["id"] | null;
  skip?: number | null;
  take?: number | null;
} = {}) {
  return prisma.bookmark.findMany({
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
    ...(take ? { take } : {}),
    ...(skip ? { skip } : {}),
    ...(cursorId ? { cursor: { id: cursorId } } : {}),
  });
}

export async function getBookmarksExport() {
  return prisma.bookmark.findMany({
    select: { id: true, url: true, title: true, createdAt: true },
    orderBy: [{ createdAt: "desc" }, { title: "asc" }],
  });
}

export async function getBookmarksLatest({ take = 3 }: { take?: number } = {}) {
  return prisma.bookmark.findMany({
    select: { id: true, url: true, title: true },
    orderBy: [{ createdAt: "desc" }, { title: "asc" }],
    take,
  });
}

export async function getBookmarksStatus() {
  return prisma.bookmark.findMany({
    select: { id: true, url: true },
    orderBy: [{ createdAt: "desc" }, { url: "asc" }],
  });
}

export async function createBookmark({
  url,
  title,
  content,
  favorite,
  tags,
  userId,
}: Pick<Bookmark, "url" | "title" | "content" | "favorite"> & {
  tags: Array<Tag["name"]>;
  userId: User["id"];
}) {
  return prisma.bookmark.create({
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
  });
}

export async function importBookmark({
  url,
  title,
  createdAt,
  userId,
}: Pick<Bookmark, "url" | "title" | "createdAt"> & {
  userId: User["id"];
}) {
  return prisma.bookmark.create({
    data: {
      url,
      title,
      createdAt,
      user: { connect: { id: userId } },
    },
    select: { id: true, url: true },
  });
}

export async function updateBookmark({
  id,
  url,
  title,
  content,
  favorite,
  tags,
  userId,
}: Pick<Bookmark, "id" | "url" | "title" | "content" | "favorite"> & {
  tags: Array<Tag["name"]>;
  userId: User["id"];
}) {
  return prisma.bookmark.update({
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
    where: { id, userId },
  });
}

export async function favoriteBookmark({
  id,
  favorite,
  userId,
}: Pick<Bookmark, "id" | "favorite"> & {
  userId: User["id"];
}) {
  return prisma.bookmark.update({
    data: { favorite },
    where: { id, userId },
  });
}

export async function deleteBookmark({
  id,
  userId,
}: Pick<Bookmark, "id"> & { userId: User["id"] }) {
  return prisma.bookmark.deleteMany({
    where: { id, userId },
  });
}
