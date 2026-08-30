import "server-only";

export {
  decryptSensitiveData,
  encryptSensitiveData,
  SensitiveDataConfigurationError,
} from "./sensitive-data-core";

import { decryptSensitiveData } from "./sensitive-data-core";

type SensitivePartnerFields = {
  panNumber?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  bankIfsc?: string | null;
};

export function decryptPartnerSensitiveFields<T extends SensitivePartnerFields>(partner: T): T {
  return {
    ...partner,
    panNumber: decryptSensitiveData(partner.panNumber),
    bankAccountName: decryptSensitiveData(partner.bankAccountName),
    bankAccountNumber: decryptSensitiveData(partner.bankAccountNumber),
    bankIfsc: decryptSensitiveData(partner.bankIfsc),
  };
}

export function redactPartnerSensitiveFields<T extends SensitivePartnerFields>(partner: T): Omit<T, keyof SensitivePartnerFields> {
  const safe = { ...partner };
  delete safe.panNumber;
  delete safe.bankAccountName;
  delete safe.bankAccountNumber;
  delete safe.bankIfsc;
  return safe;
}
