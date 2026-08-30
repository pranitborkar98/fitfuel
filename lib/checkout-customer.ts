import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type Input = {
  email: string;
  phone: string;
  name: string;
  authenticatedUserId?: string | null;
};

/** Resolve the order owner without letting a guest checkout rewrite an
 * existing account's name or phone. Email is the account boundary; a reused
 * phone number alone never attaches an order to somebody else. */
export async function resolveCheckoutCustomer(input: Input) {
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const name = input.name.trim();
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (input.authenticatedUserId !== existing.id) return existing;

    const phoneOwner = phone
      ? await prisma.user.findFirst({ where: { phone }, select: { id: true } })
      : null;
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        ...(name ? { name } : {}),
        ...(phone && (!phoneOwner || phoneOwner.id === existing.id) ? { phone } : {}),
      },
    });
  }

  const phoneOwner = phone
    ? await prisma.user.findFirst({ where: { phone }, select: { id: true } })
    : null;
  try {
    return await prisma.user.create({
      data: { email, name, ...(!phoneOwner && phone ? { phone } : {}) },
    });
  } catch (error) {
    // Two payment-init requests for the same new email may race. The unique
    // email constraint decides the winner; the other request reuses it.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const raced = await prisma.user.findUnique({ where: { email } });
      if (raced) return raced;
    }
    throw error;
  }
}
