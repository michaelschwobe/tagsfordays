import type { User } from "@prisma/client";
import { prisma } from "~/utils/db.server";

/**
 * If changing this, also double-check the same value in:
 * - `/app/utils/auth.server.ts`
 */
export async function getUserById({ id }: { id: User["id"] }) {
  return await prisma.user.findUnique({
    where: { id },
  });
}

/**
 * If changing this, also double-check the same value in:
 * - `/app/utils/auth.server.ts`
 */
export async function getUserIncludePassword({
  username,
}: {
  username: User["username"];
}) {
  return await prisma.user.findUnique({
    include: { password: true },
    where: { username },
  });
}
