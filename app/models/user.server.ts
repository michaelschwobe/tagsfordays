import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "~/utils/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function verifyLogin(
  username: User["username"],
  password: Password["hash"],
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { username },
    include: { password: true },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash,
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
