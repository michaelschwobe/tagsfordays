import { prisma } from "~/utils/db.server";
import {
  createBookmarks,
  createTags,
  createUser,
  deleteData,
} from "../tests/utils/db-utils";

async function seed() {
  const MESSAGES = {
    initialize: "🌱 Seeding database...",
    createData: "🏁 Seeded database",
    deleteData: "🧹 Cleaned database",
    createUser: "👤 Created user",
    createTags: "🏷️  Created tags",
    createBookmarks: "🔗 Created bookmarks",
    createMoreTags: "🔁 Created MORE tags",
    createMoreBookmarks: "🔁 Created MORE bookmarks",
  } as const satisfies Record<string, string>;

  console.info(["\n", MESSAGES.initialize, "\n"].join(""));
  console.time(MESSAGES.createData);

  console.time(MESSAGES.deleteData);
  await deleteData(prisma);
  console.timeEnd(MESSAGES.deleteData);

  console.time(MESSAGES.createUser);
  const user = await createUser(prisma, {
    username: "someuser",
    password: "somepass",
  });
  console.timeEnd(MESSAGES.createUser);

  console.time(MESSAGES.createTags);
  const tags = await createTags(prisma, {
    items: [
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
    ] as const satisfies ReadonlyArray<{
      id: string;
      name: string;
      createdAt?: Date | string | undefined;
    }>,
    userId: user.id,
  });
  console.timeEnd(MESSAGES.createTags);

  console.time(MESSAGES.createBookmarks);
  const bookmarks = await createBookmarks(prisma, {
    items: [
      {
        id: "bid0",
        url: "https://conform.guide",
        title: "Conform",
        content:
          "A progressive enhancement first form validation library for Remix and React Router.",
        favorite: true,
      },
      {
        id: "bid1",
        url: "https://www.prisma.io",
        title: "Prisma",
        content:
          "Prisma is a next-generation Node.js and TypeScript ORM for PostgreSQL, MySQL, SQL Server, SQLite, MongoDB, and CockroachDB. It provides type-safety, automated migrations, and an intuitive data model.",
        favorite: false,
      },
      {
        id: "bid2",
        url: "https://remix.run",
        title: "Remix",
        content:
          "Remix is a full stack web framework that lets you focus on the user interface and work back through web standards to deliver a fast, slick, and resilient user experience. People are gonna love using your stuff.",
        favorite: true,
      },
      {
        id: "bid3",
        url: "https://tailwindcss.com",
        title: "Tailwind CSS",
        content:
          "Tailwind CSS is a utility-first CSS framework for rapidly building modern websites without ever leaving your HTML.",
        favorite: false,
      },
      {
        id: "bid4",
        url: "https://www.typescriptlang.org",
        title: "TypeScript",
        content:
          "TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.",
        favorite: true,
      },
      {
        id: "bid5",
        url: "https://zod.dev",
        title: "Zod",
        content:
          "TypeScript-first schema validation with static type inference.",
        favorite: false,
      },
    ] as const satisfies ReadonlyArray<{
      id: string;
      url: string;
      title?: string | null | undefined;
      content?: string | null | undefined;
      favorite?: boolean | null | undefined;
      createdAt?: Date | string | undefined;
    }>,
    tags: tags,
    userId: user.id,
  });
  console.timeEnd(MESSAGES.createBookmarks);

  if (!process.env["MINIMAL_SEED"]) {
    console.time(MESSAGES.createMoreTags);
    const tagsMore = await createTags(prisma, {
      length: 50,
      start: tags.length,
      userId: user.id,
    });
    console.timeEnd(MESSAGES.createMoreTags);

    console.time(MESSAGES.createMoreBookmarks);
    await createBookmarks(prisma, {
      length: 50,
      start: bookmarks.length,
      tags: tagsMore,
      userId: user.id,
    });
    console.timeEnd(MESSAGES.createMoreBookmarks);
  }

  console.timeEnd(MESSAGES.createData);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
