"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

import {
  playerProfileSchema,
  type PlayerProfileInput,
} from "@/server/validations/player-profile";

import {
  playerProfileSchema as profileFormSchema,
  type PlayerProfileInput as ProfileFormInput,
} from "@/lib/validations/player-profile";

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

  if (!clerkUser || !email) {
    throw new Error("Unable to sync Clerk user.");
  }

  return prisma.user.create({
    data: {
      clerkId: userId,
      email,
      fullName: clerkUser.fullName || clerkUser.username || email,
    },
  });
}

export async function getCurrentPlayerProfile() {
  const user = await requireCurrentDatabaseUser();

  const playerProfile = await prisma.playerProfile.findUnique({
    where: { userId: user.id },
  });

  return { user, playerProfile };
}

export async function upsertPlayerProfile(input: PlayerProfileInput | FormData) {
  const user = await requireCurrentDatabaseUser();

  const parsedInput = playerProfileSchema.parse(
    input instanceof FormData ? formDataToProfileInput(input) : input,
  );

  const playerProfile = await prisma.playerProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...parsedInput },
    update: parsedInput,
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");

  return playerProfile;
}

export async function updatePlayerProfile(input: ProfileFormInput) {
  try {
    const user = await requireCurrentDatabaseUser();

    const parsedInput = profileFormSchema.parse(input);
    const { fullName, position, ...profileInput } = parsedInput;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { fullName },
      }),
      prisma.playerProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          ...profileInput,
          position: position || null,
        },
        update: {
          ...profileInput,
          position: position || null,
        },
      }),
    ]);

    revalidatePath("/profile");
    revalidatePath("/dashboard");

    return { success: true };
  } catch {
    return { success: false };
  }
}