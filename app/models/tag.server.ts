import type { Bookmark, Tag, User } from "@prisma/client";
import { prisma } from "~/utils/db.server";

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/tags.$tagId.edit.tsx`
 * - `/app/routes/tags.$tagId.merge.tsx`
 * - `/app/routes/tags.$tagId.split.tsx`
 */
export async function getTag({ id }: { id: Tag["id"] }) {
  return await prisma.tag.findFirst({
    select: { id: true, name: true },
    where: { id },
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/tags.$tagId._index.tsx`
 */
export async function getTagIncludeRelationsCount({ id }: { id: Tag["id"] }) {
  return await prisma.tag.findFirst({
    select: { id: true, name: true, _count: { select: { bookmarks: true } } },
    where: { id },
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/tags.$tagId.merge.tsx`
 * - `/app/routes/tags.$tagId.split.tsx`
 */
export async function getTagIncludeRelationsData({ id }: { id: Tag["id"] }) {
  return await prisma.tag.findFirst({
    select: {
      id: true,
      name: true,
      _count: { select: { bookmarks: true } },
      bookmarks: { select: { bookmarkId: true } },
    },
    where: { id },
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/tags.$tagId.edit.tsx`
 * - `/app/routes/tags.$tagId.merge.tsx`
 */
export async function getTagByName({ name }: { name: Tag["name"] }) {
  return await prisma.tag.findUnique({
    select: { id: true },
    where: { name },
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/tags.$tagId.split.tsx`
 * - `/app/routes/tags.new.tsx`
 */
export async function getTagsByNames({ names }: { names: Tag["name"][] }) {
  return await prisma.tag.findMany({
    select: { id: true },
    where: { name: { in: names } },
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/bookmarks.$bookmarkId.edit.tsx`
 * - `/app/routes/bookmarks.new.tsx`
 * - `/app/routes/tags.$tagId.merge.tsx`
 */
export async function getTags() {
  return await prisma.tag.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/tags._index.tsx`
 */
export async function getTagsIncludeRelationsCount({
  orderBy,
}: {
  orderBy?: string | null;
}) {
  return await prisma.tag.findMany({
    select: { id: true, name: true, _count: { select: { bookmarks: true } } },
    orderBy:
      orderBy === "relations"
        ? [{ bookmarks: { _count: "desc" } }, { name: "asc" }]
        : { name: "asc" },
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/_index.tsx`
 */
export async function getTagsLatest({ take = 10 }: { take?: number } = {}) {
  return await prisma.tag.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
    take,
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/tags.new.tsx`
 */
export async function createTag({
  name,
  userId,
}: {
  name: Tag["name"];
  userId: User["id"];
}) {
  return await prisma.tag.create({
    data: { name, user: { connect: { id: userId } } },
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/tags.$tagId.split.tsx`
 */
export async function createTagAndConnectBookmarkIds({
  bookmarkIds,
  name,
  userId,
}: {
  bookmarkIds?: Bookmark["id"][];
  name: Tag["name"];
  userId: User["id"];
}) {
  if (Array.isArray(bookmarkIds) && bookmarkIds.length > 0) {
    return await prisma.tag.create({
      data: {
        name,
        bookmarks: {
          create: bookmarkIds.map((bookmarkId) => ({
            bookmark: { connect: { id: bookmarkId } },
          })),
        },
        user: { connect: { id: userId } },
      },
    });
  }
  return await prisma.tag.create({
    data: { name, user: { connect: { id: userId } } },
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/tags.$tagId.edit.tsx`
 */
export async function updateTag({
  id,
  name,
  userId,
}: {
  id: Tag["id"];
  name: Tag["name"];
  userId: User["id"];
}) {
  return await prisma.tag.update({
    data: { name },
    where: { id, userId },
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/tags.$tagId.edit.tsx`
 */
export async function deleteTag({
  id,
  userId,
}: {
  id: Tag["id"];
  userId: User["id"];
}) {
  return await prisma.tag.deleteMany({
    where: { id, userId },
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/routes/tags.$tagId.merge.tsx`
 */
export async function mergeTag({
  sourceTagId,
  targetTagId,
  userId,
}: {
  sourceTagId: Tag["id"];
  targetTagId: Tag["id"];
  userId: User["id"];
}) {
  const [sourceRelations, targetRelations] = await Promise.all([
    prisma.tagOnBookmark.findMany({
      where: { tagId: sourceTagId },
    }),
    prisma.tagOnBookmark.findMany({
      where: { tagId: targetTagId },
    }),
  ]);
  const sourceBookmarkIds = sourceRelations.map((el) => el.bookmarkId);
  const targetBookmarkIds = targetRelations.map((el) => el.bookmarkId);
  const uniqueBookmarkIds = sourceBookmarkIds.filter(
    (bookmarkId) => !targetBookmarkIds.includes(bookmarkId),
  );
  const createTagOnBookmarkPromises = uniqueBookmarkIds.map((bookmarkId) =>
    prisma.tagOnBookmark.create({
      data: { tagId: targetTagId, bookmarkId },
    }),
  );
  const deleteSourceTagPromise = prisma.tag.deleteMany({
    where: { id: sourceTagId, userId },
  });
  return await prisma.$transaction([
    ...createTagOnBookmarkPromises,
    deleteSourceTagPromise,
  ]);
}
