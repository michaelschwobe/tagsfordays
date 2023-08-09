import type { Bookmark, Tag, User } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export function getBookmark({ id }: Pick<Bookmark, "id">) {
  return prisma.bookmark.findFirst({
    select: {
      id: true,
      url: true,
      title: true,
      description: true,
      favorite: true,
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { tag: { name: "asc" } },
      },
    },
    where: { id },
  });
}

export function getBookmarkByUrl({ url }: Pick<Bookmark, "url">) {
  return prisma.bookmark.findUnique({
    select: { id: true },
    where: { url },
  });
}

export function getBookmarks() {
  return prisma.bookmark.findMany({
    select: {
      id: true,
      url: true,
      title: true,
      favorite: true,
      _count: { select: { tags: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getLatestBookmarks({ take = 5 }: { take?: number } = {}) {
  return prisma.bookmark.findMany({
    select: { id: true, url: true, title: true },
    orderBy: [{ createdAt: "desc" }, { title: "asc" }],
    take,
  });
}

export function createBookmark({
  url,
  title,
  description,
  favorite,
  tags,
  userId,
}: Pick<Bookmark, "url" | "title" | "description" | "favorite"> & {
  tags: Array<Tag["name"]>;
  userId: User["id"];
}) {
  return prisma.bookmark.create({
    data: {
      url,
      title,
      description,
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
      user: {
        connect: { id: userId },
      },
    },
  });
}

export function updateBookmark({
  id,
  url,
  title,
  description,
  favorite,
  tags,
  userId,
}: Pick<Bookmark, "id" | "url" | "title" | "description" | "favorite"> & {
  tags: Array<Tag["name"]>;
  userId: User["id"];
}) {
  return prisma.bookmark.update({
    data: {
      url,
      title,
      description,
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

export function favoriteBookmark({
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

export function deleteBookmark({
  id,
  userId,
}: Pick<Bookmark, "id"> & { userId: User["id"] }) {
  return prisma.bookmark.deleteMany({
    where: { id, userId },
  });
}