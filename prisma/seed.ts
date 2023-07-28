import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const CONSTANTS = {
    initialize: "🌱 Seeding database...",
    createData: "🌱 Seeded database",
    deleteData: "🧹 Cleaned up the database",
    createUser: "👤 Created user",
    createTags: "🏷️  Created tags",
    createBookmarks: "🔖 Created bookmarks",
    username: "someuser",
    password: "somepass",
    tags: ["tag1", "tag2", "tag3", "tag4", "tag5"],
    bookmarks: [
      {
        url: "https://www.prisma.io",
        title: "Prisma",
        description:
          "Prisma is a next-generation Node.js and TypeScript ORM for PostgreSQL, MySQL, SQL Server, SQLite, MongoDB, and CockroachDB. It provides type-safety, automated migrations, and an intuitive data model.",
      },
      {
        url: "https://remix.run",
        title: "Remix",
        description:
          "Remix is a full stack web framework that lets you focus on the user interface and work back through web standards to deliver a fast, slick, and resilient user experience. People are gonna love using your stuff.",
      },
      {
        url: "https://tailwindcss.com",
        title: "Tailwind CSS",
        description:
          "Tailwind CSS is a utility-first CSS framework for rapidly building modern websites without ever leaving your HTML.",
      },
      {
        url: "https://www.typescriptlang.org",
        title: "TypeScript",
        description:
          "TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.",
      },
    ],
  } as const;

  console.log(CONSTANTS.initialize);
  console.time(CONSTANTS.createData);

  console.time(CONSTANTS.deleteData);
  await prisma.user
    .delete({ where: { username: CONSTANTS.username } })
    .catch(() => {});
  console.timeEnd(CONSTANTS.deleteData);

  console.time(CONSTANTS.createUser);
  const hashedPassword = await bcrypt.hash(CONSTANTS.password, 10);
  const { id: userId } = await prisma.user.create({
    data: {
      username: CONSTANTS.username,
      password: { create: { hash: hashedPassword } },
    },
    select: { id: true },
  });
  console.timeEnd(CONSTANTS.createUser);

  console.time(CONSTANTS.createTags);
  const tags = await Promise.all(
    CONSTANTS.tags.map(
      async (name) =>
        await prisma.tag.create({
          data: { name, userId },
          select: { id: true },
        }),
    ),
  );
  console.timeEnd(CONSTANTS.createTags);

  console.time(CONSTANTS.createBookmarks);
  await Promise.all(
    CONSTANTS.bookmarks.map(
      async (bookmark, bookmarkIdx) =>
        await prisma.bookmark.create({
          data: {
            url: bookmark.url,
            title: bookmark.title,
            description: bookmark.description,
            tags: {
              create: tags
                .slice(0, bookmarkIdx + 1)
                .map((tag) => ({ tag: { connect: { id: tag.id } } })),
            },
            userId,
          },
        }),
    ),
  );
  console.timeEnd(CONSTANTS.createBookmarks);

  console.timeEnd(CONSTANTS.createData);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
