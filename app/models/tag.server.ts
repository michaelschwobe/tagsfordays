import type { Tag, User } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export function getTag({ id }: Pick<Tag, "id">) {
  return prisma.tag.findFirst({
    select: {
      id: true,
      name: true,
      bookmarks: {
        include: {
          bookmark: {
            select: {
              id: true,
              title: true,
              url: true,
            },
          },
        },
        orderBy: [
          { bookmark: { createdAt: "desc" } },
          { bookmark: { title: "asc" } },
        ],
      },
    },
    where: { id },
  });
}

export function getTagByName({ name }: Pick<Tag, "name">) {
  return prisma.tag.findUnique({
    select: { id: true },
    where: { name },
  });
}

export function getTags() {
  return prisma.tag.findMany({
    select: {
      id: true,
      name: true,
      _count: { select: { bookmarks: true } },
    },
    orderBy: { name: "asc" },
  });
}

export function getTagsOrderedByRelations() {
  return prisma.tag.findMany({
    select: {
      id: true,
      name: true,
      _count: { select: { bookmarks: true } },
    },
    orderBy: [{ bookmarks: { _count: "desc" } }, { name: "asc" }],
  });
}

export function getLatestTags({ take = 5 }: { take?: number } = {}) {
  return prisma.tag.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
    take,
  });
}

export function createTag({
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

export function updateTag({
  id,
  name,
  userId,
}: Pick<Tag, "id" | "name"> & { userId: User["id"] }) {
  return prisma.tag.update({
    data: { name },
    where: { id, userId },
  });
}

export function deleteTag({
  id,
  userId,
}: Pick<Tag, "id"> & { userId: User["id"] }) {
  return prisma.tag.deleteMany({
    where: { id, userId },
  });
}

export function deleteTagByName({
  name,
  userId,
}: Pick<Tag, "name"> & { userId: User["id"] }) {
  return prisma.tag.deleteMany({
    where: { name, userId },
  });
}
