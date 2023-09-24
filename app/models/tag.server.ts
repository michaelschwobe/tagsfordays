import type { Bookmark, Tag, User } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export async function getTag({ id }: Pick<Tag, "id">) {
  return prisma.tag.findFirst({
    select: {
      id: true,
      name: true,
      _count: { select: { bookmarks: true } },
      bookmarks: {
        select: {
          bookmarkId: true,
        },
      },
    },
    where: { id },
  });
}

export async function getTagByName({ name }: Pick<Tag, "name">) {
  return prisma.tag.findUnique({
    select: { id: true },
    where: { name },
  });
}

export async function getTags() {
  return prisma.tag.findMany({
    select: {
      id: true,
      name: true,
      _count: { select: { bookmarks: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getTagsOrderedByRelations() {
  return prisma.tag.findMany({
    select: {
      id: true,
      name: true,
      _count: { select: { bookmarks: true } },
    },
    orderBy: [{ bookmarks: { _count: "desc" } }, { name: "asc" }],
  });
}

export async function getLatestTags({ take = 3 }: { take?: number } = {}) {
  return prisma.tag.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
    take,
  });
}
export type LatestTagsData = Awaited<ReturnType<typeof getLatestTags>>;

export async function createTag({
  name,
  userId,
}: Pick<Tag, "name"> & {
  userId: User["id"];
}) {
  return prisma.tag.create({
    data: {
      name,
      user: {
        connect: { id: userId },
      },
    },
  });
}

export async function createAndConnectTag({
  name,
  bookmarkIds,
  userId,
}: Pick<Tag, "name"> & {
  bookmarkIds?: Array<Bookmark["id"]> | undefined;
  userId: User["id"];
}) {
  return await prisma.tag.create({
    data: {
      name,
      ...(bookmarkIds
        ? {
            bookmarks: {
              create: bookmarkIds.map((bookmarkId) => ({
                bookmark: {
                  connect: {
                    id: bookmarkId,
                  },
                },
              })),
            },
          }
        : {}),
      user: {
        connect: { id: userId },
      },
    },
  });
}

export async function updateTag({
  id,
  name,
  userId,
}: Pick<Tag, "id" | "name"> & { userId: User["id"] }) {
  return prisma.tag.update({
    data: { name },
    where: { id, userId },
  });
}

export async function deleteTag({
  id,
  userId,
}: Pick<Tag, "id"> & { userId: User["id"] }) {
  return prisma.tag.deleteMany({
    where: { id, userId },
  });
}

export async function deleteTagByName({
  name,
  userId,
}: Pick<Tag, "name"> & { userId: User["id"] }) {
  return prisma.tag.deleteMany({
    where: { name, userId },
  });
}

export async function mergeTag({
  sourceTagId,
  targetTagId,
}: {
  sourceTagId: Tag["id"];
  targetTagId: Tag["id"];
}) {
  return prisma.tagOnBookmark.updateMany({
    where: { tagId: sourceTagId },
    data: { tagId: targetTagId },
  });
}
