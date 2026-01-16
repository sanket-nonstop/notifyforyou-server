// ======================================
// FILE: src/utils/i18n.util.ts
// ======================================

import { ErrorCode } from "@constants/error-codes.constants";
import { ERROR_MESSAGES } from "@constants/error-messages.constants";
import { LanguageCode } from "@constants/language.constants";

export const getErrorMessage = (
  code: ErrorCode,
  lang: LanguageCode = LanguageCode.EN
): string => {
  return (
    ERROR_MESSAGES?.[lang]?.[code] ||
    ERROR_MESSAGES[LanguageCode.EN][code] ||
    "Something went wrong."
  );
};
