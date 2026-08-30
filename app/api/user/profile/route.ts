import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { profilePatchSchema } from "@/lib/validation/schemas";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await enforceRateLimit(req, "read", session.user.id);
  if (!rl.ok) return rl.response;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true, email: true, phone: true, image: true, role: true,
      profile: {
        select: { dietPreference: true, fitnessGoal: true, gender: true },
      },
    },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await enforceRateLimit(req, "mutation", session.user.id);
  if (!rl.ok) return rl.response;
  const parsed = await readJson(req, profilePatchSchema);
  if (!parsed.ok) return parsed.response;
  const { name, phone, dietPreference, fitnessGoal, gender } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          ...(name !== undefined ? { name: name || null } : {}),
          ...(phone !== undefined ? { phone: phone || null } : {}),
        },
      });

      await tx.userProfile.upsert({
        where: { userId: session.user.id },
        update: {
          ...(dietPreference !== undefined ? { dietPreference: dietPreference || null } : {}),
          ...(fitnessGoal !== undefined ? { fitnessGoal: fitnessGoal || null } : {}),
          ...(gender !== undefined ? { gender: gender || null } : {}),
        },
        create: {
          userId: session.user.id,
          dietPreference: dietPreference || null,
          fitnessGoal: fitnessGoal || null,
          gender: gender || null,
        },
      });
    });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "This phone number is already linked to another account." },
        { status: 409 }
      );
    }
    throw error;
  }

  return NextResponse.json({ ok: true });
}
