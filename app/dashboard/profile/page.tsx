import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id)
    redirect("/auth/signin?callbackUrl=/dashboard/profile");

  const user = await (prisma as any).user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true, email: true, phone: true, image: true,
      profile: {
        select: { dietPreference: true, fitnessGoal: true, gender: true },
      },
    },
  });

  return <ProfileClient user={user} />;
}