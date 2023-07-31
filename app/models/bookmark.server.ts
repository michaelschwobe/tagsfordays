import type { Bookmark, User } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export function getBookmark({ id }: Pick<Bookmark, "id">) {
  return prisma.bookmark.findFirst({
    select: {
      id: true,
      url: true,
      title: true,
      description: true,
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

export function getBookmarkListItems() {
  return prisma.bookmark.findMany({
    select: {
      id: true,
      url: true,
      title: true,
      _count: { select: { tags: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export function getLatestBookmarkListItems({
  take = 5,
}: { take?: number } = {}) {
  return prisma.bookmark.findMany({
    select: { id: true, url: true, title: true },
    orderBy: [{ createdAt: "desc" }, { title: "asc" }],
    take,
  });
}

export function createBookmark({
  description,
  title,
  url,
  userId,
}: Pick<Bookmark, "url" | "title" | "description"> & {
  userId: User["id"];
}) {
  return prisma.bookmark.create({
    data: {
      url,
      title,
      description,
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
  userId,
}: Pick<Bookmark, "id" | "url" | "title" | "description"> & {
  userId: User["id"];
}) {
  return prisma.bookmark.update({
    data: {
      url,
      title,
      description,
    },
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

// tags: { create: tagIds.map((id) => ({ tag: { connect: { id } } })) },
