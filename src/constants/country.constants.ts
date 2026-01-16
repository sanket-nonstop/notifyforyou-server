// ======================================
// FILE: src/constants/country.constants.ts
// ======================================

/**
 * Country + Dial Code + Phone Validation Constants
 * -------------------------------------------------
 * Used across:
 * - Signup / Login (phone validation)
 * - User profile update
 * - OTP flows (email/phone)
 *
 * NOTE:
 * Dial codes are NOT unique globally (example: +1 = USA & Canada),
 * so any dialCode lookup must return an array.
 */

/* ----------------------------------
 DIAL CODE ENUM
----------------------------------- */
export enum DialCode {
  INDIA = "+91",
  USA = "+1",
  UK = "+44",
  CANADA = "+1",
  AUSTRALIA = "+61",
  GERMANY = "+49",
  FRANCE = "+33",
  ITALY = "+39",
  SPAIN = "+34",
  BRAZIL = "+55",
  MEXICO = "+52",
  JAPAN = "+81",
  SOUTH_KOREA = "+82",
  CHINA = "+86",
  SINGAPORE = "+65",
  UAE = "+971",
  SAUDI_ARABIA = "+966",
  SOUTH_AFRICA = "+27",
  RUSSIA = "+7",
  INDONESIA = "+62",
}

/* ----------------------------------
 COUNTRY TYPE
----------------------------------- */
export interface Country {
  name: string;
  isoCode: string; // ISO-2 (ex: IN, US)
  dialCode: DialCode;
  minPhoneLength: number;
  maxPhoneLength: number;
}

/* ----------------------------------
 COUNTRY LIST
----------------------------------- */
export const COUNTRIES = [
  {
    name: "India",
    isoCode: "IN",
    dialCode: DialCode.INDIA,
    minPhoneLength: 10,
    maxPhoneLength: 10,
  },
  {
    name: "United States",
    isoCode: "US",
    dialCode: DialCode.USA,
    minPhoneLength: 10,
    maxPhoneLength: 10,
  },
  {
    name: "United Kingdom",
    isoCode: "GB",
    dialCode: DialCode.UK,
    minPhoneLength: 10,
    maxPhoneLength: 11,
  },
  {
    name: "Canada",
    isoCode: "CA",
    dialCode: DialCode.CANADA,
    minPhoneLength: 10,
    maxPhoneLength: 10,
  },
  {
    name: "Australia",
    isoCode: "AU",
    dialCode: DialCode.AUSTRALIA,
    minPhoneLength: 9,
    maxPhoneLength: 9,
  },
  {
    name: "Germany",
    isoCode: "DE",
    dialCode: DialCode.GERMANY,
    minPhoneLength: 10,
    maxPhoneLength: 11,
  },
  {
    name: "France",
    isoCode: "FR",
    dialCode: DialCode.FRANCE,
    minPhoneLength: 9,
    maxPhoneLength: 9,
  },
  {
    name: "Italy",
    isoCode: "IT",
    dialCode: DialCode.ITALY,
    minPhoneLength: 9,
    maxPhoneLength: 10,
  },
  {
    name: "Spain",
    isoCode: "ES",
    dialCode: DialCode.SPAIN,
    minPhoneLength: 9,
    maxPhoneLength: 9,
  },
  {
    name: "Brazil",
    isoCode: "BR",
    dialCode: DialCode.BRAZIL,
    minPhoneLength: 10,
    maxPhoneLength: 11,
  },
  {
    name: "Mexico",
    isoCode: "MX",
    dialCode: DialCode.MEXICO,
    minPhoneLength: 10,
    maxPhoneLength: 10,
  },
  {
    name: "Japan",
    isoCode: "JP",
    dialCode: DialCode.JAPAN,
    minPhoneLength: 10,
    maxPhoneLength: 10,
  },
  {
    name: "South Korea",
    isoCode: "KR",
    dialCode: DialCode.SOUTH_KOREA,
    minPhoneLength: 9,
    maxPhoneLength: 10,
  },
  {
    name: "China",
    isoCode: "CN",
    dialCode: DialCode.CHINA,
    minPhoneLength: 11,
    maxPhoneLength: 11,
  },
  {
    name: "Singapore",
    isoCode: "SG",
    dialCode: DialCode.SINGAPORE,
    minPhoneLength: 8,
    maxPhoneLength: 8,
  },
  {
    name: "United Arab Emirates",
    isoCode: "AE",
    dialCode: DialCode.UAE,
    minPhoneLength: 9,
    maxPhoneLength: 9,
  },
  {
    name: "Saudi Arabia",
    isoCode: "SA",
    dialCode: DialCode.SAUDI_ARABIA,
    minPhoneLength: 9,
    maxPhoneLength: 9,
  },
  {
    name: "South Africa",
    isoCode: "ZA",
    dialCode: DialCode.SOUTH_AFRICA,
    minPhoneLength: 9,
    maxPhoneLength: 9,
  },
  {
    name: "Russia",
    isoCode: "RU",
    dialCode: DialCode.RUSSIA,
    minPhoneLength: 10,
    maxPhoneLength: 10,
  },
  {
    name: "Indonesia",
    isoCode: "ID",
    dialCode: DialCode.INDONESIA,
    minPhoneLength: 9,
    maxPhoneLength: 12,
  },
] as const satisfies readonly Country[];

/* ----------------------------------
 HELPER MAPS
----------------------------------- */

/**
 * Fast lookup by ISO code
 * Example: COUNTRY_BY_ISO["IN"]
 */
export const COUNTRY_BY_ISO: Record<string, Country> = Object.fromEntries(
  COUNTRIES.map((c) => [c.isoCode, c])
);

/**
 * Dial codes are NOT unique globally (example: +1 = USA & Canada),
 * so we store an array.
 *
 * Example:
 * COUNTRY_BY_DIAL_CODE["+1"] => [USA, Canada]
 */
export const COUNTRY_BY_DIAL_CODE: Record<string, Country[]> = COUNTRIES.reduce(
  (acc, country) => {
    const key = country.dialCode;
    if (!acc[key]) acc[key] = [];
    acc[key].push(country);
    return acc;
  },
  {} as Record<string, Country[]>
);

/* ----------------------------------
 OPTIONAL HELPERS
----------------------------------- */

/**
 * Get country by ISO code safely
 */
export const getCountryByIso = (isoCode: string): Country | null => {
  return COUNTRY_BY_ISO[isoCode.toUpperCase()] ?? null;
};

/**
 * Get countries by dial code safely
 */
export const getCountriesByDialCode = (dialCode: string): Country[] => {
  return COUNTRY_BY_DIAL_CODE[dialCode] ?? [];
};
