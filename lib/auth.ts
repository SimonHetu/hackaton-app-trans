import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import type { Role } from "@prisma/client";

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  let user = await prisma.user.findUnique({ where: { clerkId: userId } });

  // Auto-sync si le webhook a raté
  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) return null;

    const fullName =
      `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || email;

    user = await prisma.user.create({
      data: { clerkId: userId, email, fullName },
    });
  }

  return user;
}

export async function requireRole(role: Role) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== role && user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}