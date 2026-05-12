"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  playerProfileSchema,
  type PlayerProfileInput,
} from "@/server/validations/player-profile";

function formDataToProfileInput(formData: FormData): Record<string, unknown> {
  return {
    city: formData.get("city"),
    favoriteSport: formData.get("favoriteSport"),
    level: formData.get("level") ?? "BEGINNER",
    position: formData.get("position"),
  };
}

function getPrimaryEmailAddress(
  user: Awaited<ReturnType<typeof currentUser>>,
) {
  return (
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress
  );
}

async function requireCurrentDatabaseUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const existingUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  if (existingUser) return existingUser;

  const clerkUser = await currentUser();
  const email = getPrimaryEmailAddress(clerkUser);
  if (!clerkUser || !email) throw new Error("Unable to sync Clerk user.");

  return prisma.user.create({
    data: {
      clerkId: userId,
      email,
      fullName: clerkUser.fullName || clerkU