import bcrypt from "bcryptjs";
import { prisma } from "~/utils/db.server";

async function seed() {
  const CONSTANTS = {
    initialize: "🌱 Seeding database…",
    createData: "🌱 Seeded database",
    deleteData: "🧹 Cleaned up the database",
    createUser: "👤 Created user",
    createTags: "🏷️  Created tags",
    createBookmarks: "🔖 Created bookmarks",
    username: "someuser",
    password: "somepass",
    tags: [
      { id: "tid0", name: "tag1" },
      { id: "tid1", name: "tag2" },
      { id: "tid2", name: "tag3" },
      { id: "tid3", name: "tag4" },
      { id: "tid4", name: "tag5" },
      { id: "tid5", name: "tag6" },
      { id: "tid6", name: "tag7" },
      { id: "tid7", name: "tag8" },
      { id: "tid8", name: "tag9" },
      { id: "tid9", name: "tag10" },
      { id: "tid10", name: "taaaaaaaaaaaaag that is exactly 45 characters" },
    ],
    bookmarks: [
      {
        id: "bid0",
        url: "https://conform.guide",
        title: "Conform",
        content:
          "A progressive enhancement first form validation library for Remix and React Router.",
      },
      {
        id: "bid1",
        url: "https://www.prisma.io",
        title: "Prisma",
        content:
          "Prisma is a next-generation Node.js and TypeScript ORM for PostgreSQL, MySQL, SQL Server, SQLite, MongoDB, and CockroachDB. It provides type-safety, automated migrations, and an intuitive data model.",
      },
      {
        id: "bid2",
        url: "https://remix.run",
        title: "Remix",
        content:
          "Remix is a full stack web framework that lets you focus on the user interface and work back through web standards to deliver a fast, slick, and resilient user experience. People are gonna love using your stuff.",
      },
      {
        id: "bid3",
        url: "https://tailwindcss.com",
        title: "Tailwind CSS",
        content:
          "Tailwind CSS is a utility-first CSS framework for rapidly building modern websites without ever leaving your HTML.",
      },
      {
        id: "bid4",
        url: "https://www.typescriptlang.org",
        title: "TypeScript",
        content:
          "TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.",
      },
      {
        id: "bid5",
        url: "https://zod.dev",
        title: "Zod",
        content:
          "TypeScript-first schema validation with static type inference.",
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
      async ({ id, name }) =>
        await prisma.tag.create({
          data: { id, name, userId },
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
            id: bookmark.id,
            url: bookmark.url,
            title: bookmark.title,
            content: bookmark.content,
            favorite: bookmarkIdx % 2 === 0,
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
