import { faker } from "@faker-js/faker";
import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { UniqueEnforcer } from "enforce-unique";

const UniqueEnforcerBookmarkId = new UniqueEnforcer();
const UniqueEnforcerBookmarkUrl = new UniqueEnforcer();
const UniqueEnforcerTagId = new UniqueEnforcer();
const UniqueEnforcerTagName = new UniqueEnforcer();

function generateNumberArray({
  length,
  start = 0,
}: {
  length: number;
  start?: number | undefined;
}) {
  return [...Array(length + start).keys()].slice(start);
}

function generateUser({
  username,
  password,
}: {
  username?: string;
  password?: string;
} = {}) {
  return {
    username: username ?? faker.internet.userName(),
    hash: bcrypt.hashSync(password ?? faker.internet.password(), 10),
  } as const;
}

function generateTag({
  id,
  name,
  createdAt,
}: {
  id?: string | undefined;
  name?: string | undefined;
  createdAt?: string | undefined;
} = {}) {
  return {
    id: id ?? UniqueEnforcerTagId.enforce(() => faker.string.uuid()),
    name:
      name ??
      UniqueEnforcerTagName.enforce(() =>
        faker.word.adjective({ length: { min: 2, max: 45 } }),
      ),
    createdAt: createdAt ?? faker.date.past({ years: 5 }),
  } as const;
}

function generateTags({
  items,
  length,
  start,
}:
  | {
      items: ReadonlyArray<{
        createdAt?: string | undefined;
        id?: string | undefined;
        name?: string | undefined;
      }>;
      length?: never;
      start?: never;
    }
  | {
      items?: never;
      length: number;
      start?: number | undefined;
    }) {
  return items
    ? items.map((item) => generateTag(item))
    : generateNumberArray({ length, start }).map(() => generateTag());
}

function generateBookmark({
  id,
  url,
  title,
  content,
  favorite,
  createdAt,
}: {
  id?: string | undefined;
  url?: string | undefined;
  title?: string | null | undefined;
  content?: string | null | undefined;
  favorite?: boolean | null | undefined;
  createdAt?: string | undefined;
} = {}) {
  return {
    id: id ?? UniqueEnforcerBookmarkId.enforce(() => faker.string.uuid()),
    url: url ?? UniqueEnforcerBookmarkUrl.enforce(() => faker.internet.url()),
    title: title ?? faker.lorem.sentence({ min: 2, max: 16 }),
    content: content ?? faker.lorem.paragraphs({ min: 2, max: 16 }),
    favorite: favorite !== undefined ? favorite : faker.datatype.boolean(),
    createdAt: createdAt ?? faker.date.past({ years: 5 }),
  } as const;
}

function generateBookmarks({
  items,
  length,
  start,
}:
  | {
      items: ReadonlyArray<{
        id?: string | undefined;
        url?: string | undefined;
        title?: string | null | undefined;
        content?: string | null | undefined;
        favorite?: boolean | null | undefined;
        createdAt?: string | undefined;
      }>;
      length?: never;
      start?: never;
    }
  | {
      items?: never;
      length: number;
      start?: number | undefined;
    }) {
  return items
    ? items.map((item) => generateBookmark(item))
    : generateNumberArray({ length, start }).map(() => generateBookmark());
}

export async function createUser(
  prisma: PrismaClient,
  values: Parameters<typeof generateUser>[0],
) {
  const { username, hash } = generateUser(values);
  return await prisma.user.create({
    data: {
      username,
      password: { create: { hash } },
    },
  });
}

export async function createTags(
  prisma: PrismaClient,
  values: Parameters<typeof generateTags>[0] & { userId: string },
) {
  const { userId, ...params } = values;
  return await Promise.all(
    generateTags(params).map(
      async ({ id, name, createdAt }) =>
        await prisma.tag.create({
          data: { id, name, createdAt, userId },
        }),
    ),
  );
}

export async function createBookmarks(
  prisma: PrismaClient,
  values: Parameters<typeof generateBookmarks>[0] & {
    tags?: ReadonlyArray<{ id: string }> | undefined;
  } & {
    userId: string;
  },
) {
  const { tags, userId, ...params } = values;
  return await Promise.all(
    generateBookmarks(params).map(
      async ({ id, url, title, content, favorite, createdAt }, idx) =>
        await prisma.bookmark.create({
          data: {
            id,
            url,
            title,
            content,
            favorite,
            createdAt,
            ...(Array.isArray(tags) && tags.length > 0
              ? {
                  tags: {
                    create: tags
                      .slice(0, idx + 1)
                      .map((tag) => ({ tag: { connect: { id: tag.id } } })),
                  },
                }
              : {}),
            userId,
          },
        }),
    ),
  );
}

export async function deleteData(prisma: PrismaClient) {
  const tables = await prisma.$queryRaw<
    { name: string }[]
  >`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations';`;

  await prisma.$transaction([
    // Disable FK constraints to avoid relation conflicts during deletion
    prisma.$executeRawUnsafe(`PRAGMA foreign_keys = OFF`),
    // Delete all rows from each table, preserving table structures
    ...tables.map(({ name }) =>
      prisma.$executeRawUnsafe(`DELETE from "${name}"`),
    ),
    prisma.$executeRawUnsafe(`PRAGMA foreign_keys = ON`),
  ]);
}
