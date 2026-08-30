import "dotenv/config";

import { prisma } from "../lib/prisma";
import {
  assertSensitiveDataEncryptionConfigured,
  encryptSensitiveData,
  isSensitiveDataEncrypted,
} from "../lib/sensitive-data-core";

const fields = ["panNumber", "bankAccountName", "bankAccountNumber", "bankIfsc"] as const;

async function main() {
  assertSensitiveDataEncryptionConfigured();

  const partners = await prisma.partner.findMany({
    where: { OR: fields.map((field) => ({ [field]: { not: null } })) },
    select: {
      id: true,
      panNumber: true,
      bankAccountName: true,
      bankAccountNumber: true,
      bankIfsc: true,
    },
  });

  let changed = 0;
  for (const partner of partners) {
    const data: Record<string, string> = {};
    for (const field of fields) {
      const value = partner[field];
      if (value && !isSensitiveDataEncrypted(value)) data[field] = encryptSensitiveData(value);
    }

    if (Object.keys(data).length) {
      await prisma.partner.update({ where: { id: partner.id }, data });
      changed += 1;
    }
  }

  console.log(`Encrypted payout data for ${changed} partner record(s).`);
}

main()
  .catch((error) => {
    console.error("Partner payout-data migration failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
