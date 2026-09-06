/**
 * ICAO TD3 Machine Readable Zone (MRZ) parser, validator, and repair engine.
 *
 * TD3 format: 2 lines × 44 characters
 *
 * Line 1:  P<ISOCOUNTRY<<SURNAME<<GIVENNAMES<<<<<<<<<<<<
 *          0123456789012345678901234567890123456789012345
 *          0         1         2         3         4
 *
 * Line 2:  PASSPORT#<CNAT<DDDDDCFEXPIRY<CPERSONAL<<C
 *          where C = check digit, D = DOB, F = sex
 */

// ---------------------------------------------------------------------------
// Check-digit computation (ICAO Doc 9303 Part 3)
// ---------------------------------------------------------------------------

const MRZ_WEIGHTS = [7, 3, 1];
const MRZ_CHAR_VALUES: Record<string, number> = { "<": 0 };

// A-Z → 10-35
for (let i = 0; i < 26; i++) {
  MRZ_CHAR_VALUES[String.fromCharCode(65 + i)] = 10 + i;
}
// 0-9 → 0-9
for (let i = 0; i <= 9; i++) {
  MRZ_CHAR_VALUES[String(i)] = i;
}

export function computeCheckDigit(value: string): number {
  let sum = 0;
  for (let i = 0; i < value.length; i++) {
    const ch = value[i]!.toUpperCase();
    const charVal = MRZ_CHAR_VALUES[ch] ?? 0;
    sum += charVal * (MRZ_WEIGHTS[i % 3] ?? 1);
  }
  return sum % 10;
}

export function validateCheckDigit(value: string, expectedDigit: string): boolean {
  const expected = parseInt(expectedDigit, 10);
  if (isNaN(expected)) return false;
  return computeCheckDigit(value) === expected;
}

// ---------------------------------------------------------------------------
// Controlled character confusions & Check-Digit-Driven Auto-Repair
// ---------------------------------------------------------------------------

const NUMERIC_CONFUSIONS: Record<string, string[]> = {
  O: ["0"],
  Q: ["0"],
  D: ["0"],
  U: ["0"],
  I: ["1"],
  L: ["1"],
  Z: ["2"],
  E: ["3"],
  B: ["8", "3"],
  A: ["4"],
  S: ["5"],
  G: ["6"],
  b: ["6"],
  T: ["7"],
  Y: ["7"],
  P: ["9"],
  g: ["9"],
};

const ALPHANUMERIC_CONFUSIONS: Record<string, string[]> = {
  O: ["0"],
  "0": ["O"],
  I: ["1"],
  "1": ["I"],
  Z: ["2"],
  "2": ["Z"],
  S: ["5"],
  "5": ["S"],
  B: ["8"],
  "8": ["B"],
  G: ["6"],
  "6": ["G"],
  D: ["0", "O"],
  U: ["V", "0"],
  V: ["U"],
};

/**
 * Validates whether a YYMMDD string represents a plausible calendar date.
 */
export function isValidMrzDate(yymmdd: string): boolean {
  if (!/^\d{6}$/.test(yymmdd)) return false;
  const mm = parseInt(yymmdd.slice(2, 4), 10);
  const dd = parseInt(yymmdd.slice(4, 6), 10);
  if (mm < 1 || mm > 12) return false;
  if (dd < 1 || dd > 31) return false;
  return true;
}

export type RepairResult = {
  value: string;
  checkDigit: string;
  repaired: boolean;
  repairNote?: string;
};

/**
 * Uses ICAO check digit weights to attempt deterministic single-character repairs.
 * If the check digit does not match, tests plausible OCR character substitutions.
 * If and only if exactly ONE candidate satisfies the check digit (and optional validator),
 * it accepts the repair.
 */
export function repairFieldWithCheckDigit(
  field: string,
  checkDigit: string,
  isNumericOnly: boolean,
  validator?: (val: string) => boolean,
): RepairResult | null {
  const fixedCheck = isNumericOnly ? fixNumeric(checkDigit) : checkDigit;

  // If already valid
  if (validateCheckDigit(field, fixedCheck)) {
    if (fixedCheck !== checkDigit) {
      return {
        value: field,
        checkDigit: fixedCheck,
        repaired: true,
        repairNote: `Check digit normalized from '${checkDigit}' to '${fixedCheck}'`,
      };
    }
    return { value: field, checkDigit, repaired: false };
  }

  // Try single-character substitutions in field
  const confusions = isNumericOnly ? NUMERIC_CONFUSIONS : ALPHANUMERIC_CONFUSIONS;
  const candidates: Array<{ val: string; chk: string; note: string }> = [];

  for (let i = 0; i < field.length; i++) {
    const ch = field[i]!;
    const altChars = confusions[ch] || [];
    for (const alt of altChars) {
      const candidateVal = field.slice(0, i) + alt + field.slice(i + 1);
      if (validator && !validator(candidateVal)) continue;
      if (validateCheckDigit(candidateVal, fixedCheck)) {
        candidates.push({
          val: candidateVal,
          chk: fixedCheck,
          note: `Position ${i}: corrected '${ch}' to '${alt}'`,
        });
      }
    }
  }

  // Also check if the check digit itself was a misread character
  const altCheckDigits = NUMERIC_CONFUSIONS[checkDigit] || [];
  for (const altChk of altCheckDigits) {
    if (validateCheckDigit(field, altChk)) {
      if (validator && !validator(field)) continue;
      candidates.push({
        val: field,
        chk: altChk,
        note: `Check digit corrected from '${checkDigit}' to '${altChk}'`,
      });
    }
  }

  // Accept only if deterministic (exactly 1 candidate)
  if (candidates.length === 1) {
    return {
      value: candidates[0]!.val,
      checkDigit: candidates[0]!.chk,
      repaired: true,
      repairNote: candidates[0]!.note,
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Date conversion
// ---------------------------------------------------------------------------

/**
 * Converts MRZ date YYMMDD to ISO 8601 YYYY-MM-DD.
 * Uses a window based on current year:
 * For DOB: if YY <= currentYY, 2000s; else 1900s.
 * For general: if YY <= currentYY + 10, current century; else previous century.
 */
export function mrzDateToIso(yymmdd: string): string {
  if (!/^\d{6}$/.test(yymmdd)) return "";
  const yy = parseInt(yymmdd.slice(0, 2), 10);
  const mm = yymmdd.slice(2, 4);
  const dd = yymmdd.slice(4, 6);
  const currentYear = new Date().getFullYear();
  const currentYY = currentYear % 100;
  const century =
    yy <= currentYY + 10
      ? Math.floor(currentYear / 100) * 100
      : (Math.floor(currentYear / 100) - 1) * 100;
  const yyyy = century + yy;
  return `${yyyy}-${mm}-${dd}`;
}

// ---------------------------------------------------------------------------
// Nationality code → readable label
// ---------------------------------------------------------------------------

const NATIONALITY_MAP: Record<string, string> = {
  AFG: "Afghan",
  ALB: "Albanian",
  DZA: "Algerian",
  AND: "Andorran",
  AGO: "Angolan",
  ARG: "Argentine",
  ARM: "Armenian",
  AUS: "Australian",
  AUT: "Austrian",
  AZE: "Azerbaijani",
  BHS: "Bahamian",
  BHR: "Bahraini",
  BGD: "Bangladeshi",
  BLR: "Belarusian",
  BEL: "Belgian",
  BLZ: "Belizean",
  BEN: "Beninese",
  BTN: "Bhutanese",
  BOL: "Bolivian",
  BIH: "Bosnian",
  BWA: "Botswanan",
  BRA: "Brazilian",
  BRN: "Bruneian",
  BGR: "Bulgarian",
  BFA: "Burkinabe",
  BDI: "Burundian",
  CPV: "Cape Verdean",
  KHM: "Cambodian",
  CMR: "Cameroonian",
  CAN: "Canadian",
  CAF: "Central African",
  TCD: "Chadian",
  CHL: "Chilean",
  CHN: "Chinese",
  COL: "Colombian",
  COM: "Comorian",
  COD: "Congolese",
  CRI: "Costa Rican",
  HRV: "Croatian",
  CUB: "Cuban",
  CYP: "Cypriot",
  CZE: "Czech",
  DNK: "Danish",
  DJI: "Djiboutian",
  DOM: "Dominican",
  ECU: "Ecuadorian",
  EGY: "Egyptian",
  SLV: "Salvadorian",
  GNQ: "Equatoguinean",
  ERI: "Eritrean",
  EST: "Estonian",
  SWZ: "Swazi",
  ETH: "Ethiopian",
  FJI: "Fijian",
  FIN: "Finnish",
  FRA: "French",
  GAB: "Gabonese",
  GMB: "Gambian",
  GEO: "Georgian",
  DEU: "German",
  GHA: "Ghanaian",
  GRC: "Greek",
  GTM: "Guatemalan",
  GIN: "Guinean",
  GNB: "Bissau-Guinean",
  GUY: "Guyanese",
  HTI: "Haitian",
  HND: "Honduran",
  HUN: "Hungarian",
  ISL: "Icelandic",
  IND: "Indian",
  IDN: "Indonesian",
  IRN: "Iranian",
  IRQ: "Iraqi",
  IRL: "Irish",
  ISR: "Israeli",
  ITA: "Italian",
  JAM: "Jamaican",
  JPN: "Japanese",
  JOR: "Jordanian",
  KAZ: "Kazakhstani",
  KEN: "Kenyan",
  PRK: "North Korean",
  KOR: "South Korean",
  KWT: "Kuwaiti",
  KGZ: "Kyrgyzstani",
  LAO: "Laotian",
  LVA: "Latvian",
  LBN: "Lebanese",
  LSO: "Basotho",
  LBR: "Liberian",
  LBY: "Libyan",
  LIE: "Liechtensteiner",
  LTU: "Lithuanian",
  LUX: "Luxembourgish",
  MDG: "Malagasy",
  MWI: "Malawian",
  MYS: "Malaysian",
  MDV: "Maldivian",
  MLI: "Malian",
  MLT: "Maltese",
  MRT: "Mauritanian",
  MUS: "Mauritian",
  MEX: "Mexican",
  MDA: "Moldovan",
  MCO: "Monegasque",
  MNG: "Mongolian",
  MNE: "Montenegrin",
  MAR: "Moroccan",
  MOZ: "Mozambican",
  MMR: "Myanmarese",
  NAM: "Namibian",
  NPL: "Nepali",
  NLD: "Dutch",
  NZL: "New Zealander",
  NIC: "Nicaraguan",
  NER: "Nigerien",
  NGA: "Nigerian",
  MKD: "Macedonian",
  NOR: "Norwegian",
  OMN: "Omani",
  PAK: "Pakistani",
  PAN: "Panamanian",
  PNG: "Papua New Guinean",
  PRY: "Paraguayan",
  PER: "Peruvian",
  PHL: "Filipino",
  POL: "Polish",
  PRT: "Portuguese",
  QAT: "Qatari",
  ROU: "Romanian",
  RUS: "Russian",
  RWA: "Rwandan",
  SAU: "Saudi Arabian",
  SEN: "Senegalese",
  SRB: "Serbian",
  SLE: "Sierra Leonean",
  SGP: "Singaporean",
  SVK: "Slovak",
  SVN: "Slovenian",
  SOM: "Somali",
  ZAF: "South African",
  SSD: "South Sudanese",
  ESP: "Spanish",
  LKA: "Sri Lankan",
  SDN: "Sudanese",
  SUR: "Surinamese",
  SWE: "Swedish",
  CHE: "Swiss",
  SYR: "Syrian",
  TWN: "Taiwanese",
  TJK: "Tajik",
  TZA: "Tanzanian",
  THA: "Thai",
  TLS: "Timorese",
  TGO: "Togolese",
  TTO: "Trinidadian",
  TUN: "Tunisian",
  TUR: "Turkish",
  TKM: "Turkmen",
  UGA: "Ugandan",
  UKR: "Ukrainian",
  ARE: "Emirati",
  GBR: "British",
  USA: "American",
  URY: "Uruguayan",
  UZB: "Uzbekistani",
  VEN: "Venezuelan",
  VNM: "Vietnamese",
  YEM: "Yemeni",
  ZMB: "Zambian",
  ZWE: "Zimbabwean",
};

export function nationalityToLabel(isoCode: string): string {
  const code = isoCode.replace(/<+$/, "").toUpperCase();
  return NATIONALITY_MAP[code] ?? code;
}

// ---------------------------------------------------------------------------
// OCR error correction helpers
// ---------------------------------------------------------------------------

/** Fix common OCR substitutions in an alpha-only field (with < filler). */
export function fixAlpha(s: string): string {
  return s
    .toUpperCase()
    .replace(/0/g, "O")
    .replace(/1/g, "I")
    .replace(/8/g, "B")
    .replace(/2/g, "Z")
    .replace(/5/g, "S");
}

/** Fix common OCR substitutions in a numeric-only field (digits + check digit). */
export function fixNumeric(s: string): string {
  return s
    .toUpperCase()
    .replace(/O/g, "0")
    .replace(/Q/g, "0")
    .replace(/D/g, "0")
    .replace(/I/g, "1")
    .replace(/L/g, "1")
    .replace(/B/g, "8")
    .replace(/Z/g, "2")
    .replace(/S/g, "5")
    .replace(/G/g, "6")
    .replace(/b/g, "6");
}

/** Passport number field: alphanumeric (letters stay letters, keep <). */
export function fixPassportNum(s: string): string {
  return s.toUpperCase().replace(/\s+/g, "<");
}

// ---------------------------------------------------------------------------
// MRZ line normalisation & line reconstruction
// ---------------------------------------------------------------------------

/**
 * Normalises a raw OCR MRZ line:
 * - strips whitespace
 * - replaces common chevron misreadings (e.g. «, ‹, (, ), [, ]) with <
 * - replaces non-alphanumeric characters with <
 * - pads with < or trims to exactly 44 characters
 */
export function normaliseMrzLine(raw: string): string {
  let s = raw.toUpperCase();

  // In MRZ, trailing filler chevrons <<<<<< are often misread as isolated K, L, 1, 0, C, X with spaces:
  // e.g. " K K K K L " -> "<<<<<"
  s = s.replace(/(\s+|<)[KL01XC](?=\s+|<|$)/g, "$1<");

  // Trailing repetitive K/L noise runs at line end (from security strip or misread filler):
  s = s.replace(/[KL01]{3,}\s*$/g, (m) => "<".repeat(m.trim().length));

  const cleaned = s
    .replace(/\s+/g, "")
    .replace(/[«‹()[\]{}\-_.:;\\|]/g, "<")
    .replace(/[^A-Z0-9<]/g, "<");

  // Fix isolated noise characters inside chevron runs (e.g., <<<<K<<<< -> <<<<<<<<<)
  let chevronCleaned = cleaned;
  let prev = "";
  while (chevronCleaned !== prev) {
    prev = chevronCleaned;
    chevronCleaned = chevronCleaned.replace(
      /(<{2,})([A-Z0-9]{1,2})(<{2,})/g,
      (_m, pre, noise, post) => pre + "<".repeat(noise.length) + post,
    );
  }

  return chevronCleaned.padEnd(44, "<").slice(0, 44);
}

// ---------------------------------------------------------------------------
// TD3 MRZ parsing & validation
// ---------------------------------------------------------------------------

export type MrzConfidence = "HIGH" | "MEDIUM" | "LOW";

export type MrzParseResult = {
  ok: boolean;
  confidence: MrzConfidence;
  confidenceScore: number; // 0 - 100
  lowConfidence: boolean;
  errors: string[];
  warnings: string[];
  repairedFields: string[];
  documentType: string;
  issuingCountry: string;
  surname: string;
  givenNames: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string; // ISO YYYY-MM-DD
  sex: string; // M | F | (empty)
  expiryDate: string; // ISO YYYY-MM-DD
  personalNumber: string;
  rawLine1: string;
  rawLine2: string;
};

const EMPTY_RESULT: MrzParseResult = {
  ok: false,
  confidence: "LOW",
  confidenceScore: 0,
  lowConfidence: true,
  errors: [],
  warnings: [],
  repairedFields: [],
  documentType: "",
  issuingCountry: "",
  surname: "",
  givenNames: "",
  passportNumber: "",
  nationality: "",
  dateOfBirth: "",
  sex: "",
  expiryDate: "",
  personalNumber: "",
  rawLine1: "",
  rawLine2: "",
};

/**
 * Computes structural reliability score (0 - 100) for a parsed MRZ candidate.
 */
export function scoreMrz(res: MrzParseResult): number {
  let score = 0;
  if (res.rawLine1.length === 44 && res.rawLine2.length === 44) score += 20;
  if (res.documentType.startsWith("P")) score += 10;
  if (res.surname && res.givenNames) score += 15;
  if (res.nationality.length >= 2) score += 5;
  if (/^[A-Z0-9]{6,10}$/.test(res.passportNumber)) score += 15;
  if (res.dateOfBirth) score += 15;
  if (res.expiryDate) score += 15;
  if (res.sex === "M" || res.sex === "F") score += 5;

  // Bonus for clean TD3 filler structure
  if (res.rawLine1.endsWith("<<<")) score += 5;
  if (res.rawLine2.endsWith("<")) score += 5;

  // Deductions for issues
  score -= res.repairedFields.length * 4;
  score -= res.warnings.length * 8;
  score -= res.errors.length * 25;

  // Deductions for suspicious filler noise in names
  if (/\b[KL]\b/.test(res.givenNames)) score -= 15;
  if (/^[KL]{3,}$/.test(res.givenNames)) score -= 30;

  return Math.max(0, Math.min(100, score));
}

// ---------------------------------------------------------------------------
// MRZ Name Normalization & Field Extraction (ICAO Doc 9303 TD3)
// ---------------------------------------------------------------------------

export type ParsedMrzName = {
  surname: string;
  givenNames: string;
  givenName: string; // alias for givenNames
  separatorRecovered: boolean;
};

/**
 * Cleans word-ending chevron artifacts if a word was concatenated with a misread chevron:
 * E.g.
 * - Double letters at the end from doubled chevron: "MARKK" -> "MARK", "MALIKK" -> "MALIK"
 * - Misread chevron attached to standard name endings:
 *   - "ZAHIDULK" / "ZAHIDULL" -> "ZAHIDUL"
 *   - "RAHMANK" / "RAHMANL" -> "RAHMAN"
 *   - "AHMEDK" / "AHMEDL" -> "AHMED"
 *   - "ISLAMK" / "ISLAML" -> "ISLAM"
 *   - "KHANK" / "KHANL" -> "KHAN"
 * Preserves legitimate names ending in K or L (e.g. MARK, CLARK, MALIK, TARIK, KHALIL, KAMAL, PAUL).
 */
export function cleanWordArtifact(word: string): string {
  if (word.length <= 3) return word;

  // 1. Double letter artifacts at the end (e.g. KK -> K, LL -> L)
  if (word.endsWith("KK")) return word.slice(0, -1);
  if (word.endsWith("LL")) return word.slice(0, -1);

  // 2. Specific known name endings concatenated with misread chevron K or L:
  if (/[A-Z]+UL[KL]$/.test(word)) {
    return word.slice(0, -1);
  }
  if (word.length >= 5 && /[A-Z]+AN[KL]$/.test(word)) {
    return word.slice(0, -1);
  }
  if (word.length >= 5 && /[A-Z]+ED[KL]$/.test(word)) {
    return word.slice(0, -1);
  }
  if (word.length >= 5 && /[A-Z]+AM[KL]$/.test(word)) {
    return word.slice(0, -1);
  }
  if (word.length >= 5 && /[A-Z]+IN[KL]$/.test(word)) {
    return word.slice(0, -1);
  }

  return word;
}

/**
 * Cleans word-beginning chevron artifacts where the preceding chevron << or <
 * merged with the vertical stem of the first letter (e.g. "<" + "|" of "R" -> "K" + "ROBIN" -> "KROBIN").
 *
 * Preserves legitimate names starting with K or L:
 * - Names starting with K followed by a vowel or H:
 *   KAMAL, KABIR, KARIM, KHALIL, KASHEM, KUMAR, KISHORE, KHAN, KAZI, etc.
 * - Names starting with L followed by a vowel:
 *   LIMA, LATIF, LOKMAN, LUBNAN, LABIB, etc.
 * - Legitimate names starting with consonant blends like KRISHNA:
 *   explicitly preserved.
 *
 * Catches unnatural consonant clusters formed by chevron misreading:
 * - K + R: KROBIN -> ROBIN
 * - L + R: LROBIN -> ROBIN
 * - K + B, K + D, K + M, K + N, K + P, K + T, etc.
 */
export function cleanLeadingWordArtifact(word: string): string {
  if (word.length <= 3) return word;
  const upper = word.toUpperCase();

  // Explicit exception for legitimate names starting with KR
  if (upper === "KRISHNA") return word;

  // If word starts with K or L followed by a consonant other than H:
  // e.g. KR in KROBIN (where < + R stem became K), KB, KD, KM, KN, KP, KT
  if (/^[KL][BCDFGJKLMNPQRSTVWXZ]/i.test(upper)) {
    return word.slice(1);
  }

  return word;
}

/**
 * Removes trailing filler chevrons and trailing OCR noise characters (K, L, C, X, 0, 1)
 * that occur inside the trailing filler zone of the name field.
 */
export function cleanTrailingFiller(s: string): string {
  let cleaned = s.replace(/[«‹()[\]{}\-_.:;\\|]/g, "<");
  let prev = "";
  while (cleaned !== prev) {
    prev = cleaned;
    // Strip trailing chevrons
    cleaned = cleaned.replace(/<+$/, "");
    // Strip trailing isolated chevron noise tokens (e.g. <K, <L, <KL, <LK, <C, <X, <0, <1)
    cleaned = cleaned.replace(/<[KLXCO01]{1,2}$/, "");
    // Strip trailing pure K/L filler noise runs (e.g. <LLLL, <KKKK, <LLLLLLLLKL)
    cleaned = cleaned.replace(/<[KL01]{2,}$/, "");
  }
  return cleaned;
}

/**
 * Formats a raw MRZ name string (surname or given names):
 * - fixes common alpha OCR mistakes (0->O, 1->I, 8->B)
 * - removes remaining filler chevrons
 * - converts internal chevrons to spaces
 * - collapses multiple spaces
 * - trims whitespace
 * - filters out any stray isolated trailing OCR noise tokens (e.g. trailing "K", "L", "KL", "LLLLLLLLLKL")
 */
function formatNamePart(raw: string, isSurname: boolean): string {
  if (!raw) return "";

  // 1. Alpha correction (0->O, 1->I, 8->B)
  const fixed = fixAlpha(raw);

  // 2. Clean leading/trailing chevrons
  const trimmed = fixed.replace(/^<+/, "").replace(/<+$/, "");

  // 3. Split by chevron
  const rawWords = trimmed
    .split("<")
    .map((w) => w.trim())
    .filter(Boolean);

  if (rawWords.length === 0) return "";

  // 4. Clean word artifacts for each word (both trailing and leading chevron artifacts)
  const words = rawWords.map((w, idx) => {
    let word = cleanWordArtifact(w);
    // For given names, clean leading chevron artifacts from the first word
    if (!isSurname && idx === 0) {
      word = cleanLeadingWordArtifact(word);
    }
    return word;
  });

  // 5. Filter out trailing OCR filler noise tokens (e.g. trailing "K", "L", "KL", "LLLLLLLLLKL")
  // These occur when the OCR misreads the trailing filler chevrons <<<<<<<<<<<<<<<<
  const isFillerNoiseToken = (token: string): boolean => {
    const t = token.toUpperCase();
    if (["K", "L", "C", "X", "O", "0", "1"].includes(t)) return true;
    if (/^[KL01]{2,3}$/.test(t)) return true;
    if (t.length >= 3 && /^[KL01]+$/.test(t)) return true;
    if (
      t.length >= 3 &&
      !/[AEIOUY]/.test(t) &&
      /^[BCDFGHJKLMNPQRSTVWXZ]+$/.test(t) &&
      (t.includes("K") || t.includes("L"))
    ) {
      return true;
    }
    return false;
  };

  while (words.length > 1 && isFillerNoiseToken(words[words.length - 1]!)) {
    words.pop();
  }

  if (words.length === 1 && isFillerNoiseToken(words[0]!)) {
    return "";
  }

  // 6. If isSurname and multiple words, check if last word was a corrupted chevron before separator (e.g. "RAHMAN KL" -> "RAHMAN")
  if (isSurname && words.length > 1) {
    const lastWord = words[words.length - 1]!;
    if (["K", "L", "C", "X", "KL", "LK"].includes(lastWord)) {
      words.pop();
    }
  }

  return words.join(" ");
}

/**
 * Normalises and extracts surname and given names from ICAO TD3 Line 1 or raw Name field.
 *
 * TD3 Line 1 Name Field:
 *   Characters 5 to 43 (39 characters):
 *   SURNAME<<GIVEN<NAMES<<<<<<<<<<<<<<<<<<<<
 *
 * Rules:
 *   1. Double chevron `<<` separates surname from given names.
 *   2. Single chevron `<` separates multiple given names.
 *   3. Trailing chevrons `<` pad the field to the 44-character line boundary.
 *   4. Accurately recovers corrupted separators (e.g. `K<`, `L<`, `<KL<`) and cleans
 *      filler noise without stripping letters from legitimate names (e.g. KHALIL, KAMAL, MALIK, MARK, ALI).
 *
 * @param input Full 44-char Line 1 or 39-char name field
 * @param toTitleCase If true, converts to Title Case ("Rahman", "Md Zahidul"); default false (uppercase)
 */
export function parseMrzName(input: string, toTitleCase = false): ParsedMrzName {
  const line = normaliseMrzLine(input);

  // If input is a full MRZ Line 1 (starts with P< or P + valid country code, exactly 44 chars):
  let nameField = line;
  if (
    line.length >= 40 &&
    (line.startsWith("P<") || (line[0] === "P" && Boolean(NATIONALITY_MAP[line.slice(2, 5)])))
  ) {
    nameField = line.slice(5, 44);
  }

  // 1. Clean trailing filler chevrons and trailing chevron artifacts
  nameField = cleanTrailingFiller(nameField);

  let surnamePart = "";
  let givenPart = "";
  let separatorRecovered = false;

  // 1. Look for the double chevron separator <<
  const doubleChevronIdx = nameField.indexOf("<<");
  if (doubleChevronIdx !== -1) {
    surnamePart = nameField.slice(0, doubleChevronIdx);
    givenPart = nameField.slice(doubleChevronIdx + 2);
  } else {
    // Attempt structural recovery of corrupted separator
    separatorRecovered = true;

    // Pattern 1: SURNAME + [K|L]< + GIVEN (e.g. RAHMANK<MD, RAHMANL<MD)
    const m1 = /^([A-Z]+?)[KL]<([A-Z].*)$/.exec(nameField);
    // Pattern 2: SURNAME + <[K|L]< + GIVEN (e.g. RAHMAN<K<MD, RAHMAN<L<MD)
    const m2 = /^([A-Z]+?)<(?:KL|LK|K|L)<([A-Z].*)$/.exec(nameField);
    // Pattern 3: SURNAME + [KL]{2}<* + GIVEN (e.g. RAHMANKL<MD, RAHMANKLMD)
    const m3 = /^([A-Z]+?)(?:KL|LK|KK|LL)<*([A-Z].*)$/.exec(nameField);
    // Pattern 4: SURNAME + <[K|L] + GIVEN (e.g. RAHMAN<KMD, RAHMAN<LMD)
    const m4 = /^([A-Z]+?)<[KL]([A-Z].*)$/.exec(nameField);
    // Pattern 5: Single chevron fallback (e.g. RAHMAN<MD<ZAHIDUL)
    const m5 = /^([A-Z]+?)<([A-Z].*)$/.exec(nameField);

    if (m1) {
      surnamePart = m1[1]!;
      givenPart = m1[2]!;
    } else if (m2) {
      surnamePart = m2[1]!;
      givenPart = m2[2]!;
    } else if (m3) {
      surnamePart = m3[1]!;
      givenPart = m3[2]!;
    } else if (m4) {
      surnamePart = m4[1]!;
      givenPart = m4[2]!;
    } else if (m5) {
      surnamePart = m5[1]!;
      givenPart = m5[2]!;
    } else {
      surnamePart = nameField;
      givenPart = "";
    }
  }

  // 2. In ICAO TD3 given names:
  // - Single chevron < separates multiple given names.
  // - Double chevron << NEVER appears inside a given name; the first << marks the start of the filler zone!
  const fillerStartIdx = givenPart.indexOf("<<");
  if (fillerStartIdx !== -1) {
    givenPart = givenPart.slice(0, fillerStartIdx);
  }

  // Clean trailing filler chevrons and trailing filler artifacts
  surnamePart = cleanTrailingFiller(surnamePart);
  givenPart = cleanTrailingFiller(givenPart);

  // 3. Format surname and given names
  const surnameFormatted = formatNamePart(surnamePart, true);
  const givenFormatted = formatNamePart(givenPart, false);

  const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  const surname = toTitleCase ? titleCase(surnameFormatted) : surnameFormatted.toUpperCase();
  const givenNames = toTitleCase ? titleCase(givenFormatted) : givenFormatted.toUpperCase();

  return {
    surname,
    givenNames,
    givenName: givenNames,
    separatorRecovered,
  };
}

/**
 * Parse and validate an ICAO TD3 passport MRZ with controlled error correction.
 * @param line1Raw 44-character string (row 1 of MRZ)
 * @param line2Raw 44-character string (row 2 of MRZ)
 */
export function parseMrz(line1Raw: string, line2Raw: string): MrzParseResult {
  const line1 = normaliseMrzLine(line1Raw);
  const line2 = normaliseMrzLine(line2Raw);
  const errors: string[] = [];
  const warnings: string[] = [];
  const repairedFields: string[] = [];

  if (line1.length !== 44 || line2.length !== 44) {
    return { ...EMPTY_RESULT, errors: ["MRZ lines are not 44 characters each."] };
  }

  // --- Line 1 ---
  const documentType = fixAlpha(line1.slice(0, 2)).replace(/<+$/, "");
  const issuingCountry = fixAlpha(line1.slice(2, 5)).replace(/<+$/, "");

  // Always extract surname and given names in UPPERCASE (ICAO standard)
  const parsedName = parseMrzName(line1, false);
  const surname = parsedName.surname.toUpperCase();
  const givenNames = parsedName.givenNames.toUpperCase();
  if (parsedName.separatorRecovered) {
    repairedFields.push("nameSeparator");
  }

  // --- Line 2 ---
  let passportNumberRaw = fixPassportNum(line2.slice(0, 9));
  let passportCheckRaw = fixNumeric(line2[9] ?? "");
  const nationalityRaw = fixAlpha(line2.slice(10, 13)).replace(/<+$/, "");
  let dobRaw = fixNumeric(line2.slice(13, 19));
  let dobCheck = fixNumeric(line2[19] ?? "");
  const sexRaw = fixAlpha(line2[20] ?? "").replace(/<+$/, "");
  let expiryRaw = fixNumeric(line2.slice(21, 27));
  let expiryCheck = fixNumeric(line2[27] ?? "");
  const personalNumberRaw = line2.slice(28, 42);
  const personalCheckRaw = line2[42] ?? "";
  const compositeCheckRaw = line2[43] ?? "";

  // --- Intelligent Check-Digit-Driven Auto-Repair ---

  // 1. Passport Number
  const passRepair = repairFieldWithCheckDigit(passportNumberRaw, passportCheckRaw, false);
  if (passRepair) {
    if (passRepair.repaired) {
      passportNumberRaw = passRepair.value;
      passportCheckRaw = passRepair.checkDigit;
      repairedFields.push(`passportNumber (${passRepair.repairNote})`);
    }
  } else {
    errors.push("Passport number check digit failed — please verify passport number.");
  }

  // 2. Date of Birth
  const dobRepair = repairFieldWithCheckDigit(dobRaw, dobCheck, true, isValidMrzDate);
  if (dobRepair) {
    if (dobRepair.repaired) {
      dobRaw = dobRepair.value;
      dobCheck = dobRepair.checkDigit;
      repairedFields.push(`dateOfBirth (${dobRepair.repairNote})`);
    }
  } else {
    warnings.push("Date of birth check digit mismatch — please verify date of birth.");
  }

  // 3. Expiry Date
  const expRepair = repairFieldWithCheckDigit(expiryRaw, expiryCheck, true, isValidMrzDate);
  if (expRepair) {
    if (expRepair.repaired) {
      expiryRaw = expRepair.value;
      expiryCheck = expRepair.checkDigit;
      repairedFields.push(`expiryDate (${expRepair.repairNote})`);
    }
  } else {
    warnings.push("Expiry date check digit mismatch — please verify expiry date.");
  }

  // 4. Composite check (positions 0-9, 13-19, 21-42 of line 2)
  const compositeValue =
    passportNumberRaw +
    passportCheckRaw +
    dobRaw +
    dobCheck +
    expiryRaw +
    expiryCheck +
    personalNumberRaw +
    personalCheckRaw;

  const compositeCheckOk = validateCheckDigit(compositeValue, compositeCheckRaw);
  if (!compositeCheckOk && compositeCheckRaw !== "<") {
    // If check digit is not filler and failed, add warning
    warnings.push("MRZ composite check digit mismatch — some fields may need review.");
  }

  // --- Format fields ---
  const sex = sexRaw === "M" ? "M" : sexRaw === "F" ? "F" : "";
  const dateOfBirth = mrzDateToIso(dobRaw);
  const expiryDate = mrzDateToIso(expiryRaw);
  const nationality = nationalityToLabel(nationalityRaw);
  const personalNumber = personalNumberRaw.replace(/<+$/, "");

  const ok = errors.length === 0;

  const partialResult: MrzParseResult = {
    ok,
    confidence: "LOW",
    confidenceScore: 0,
    lowConfidence: true,
    errors,
    warnings,
    repairedFields,
    documentType,
    issuingCountry,
    surname,
    givenNames,
    passportNumber: passportNumberRaw.replace(/<+$/, ""),
    nationality,
    dateOfBirth,
    sex,
    expiryDate,
    personalNumber,
    rawLine1: line1,
    rawLine2: line2,
  };

  const confidenceScore = scoreMrz(partialResult);
  let confidence: MrzConfidence = "LOW";
  if (confidenceScore >= 80 && ok && errors.length === 0) {
    confidence = "HIGH";
  } else if (confidenceScore >= 55 && ok) {
    confidence = "MEDIUM";
  }

  const lowConfidence = confidence === "LOW" || warnings.length > 0;

  return {
    ...partialResult,
    confidence,
    confidenceScore,
    lowConfidence,
  };
}

// ---------------------------------------------------------------------------
// MRZ line detection from raw OCR text
// ---------------------------------------------------------------------------

/**
 * Extracts candidate pairs from OCR text and selects the best candidate pair.
 */
export function extractMrzLines(ocrText: string): [string, string] | null {
  const candidates = extractAllMrzCandidates(ocrText);
  if (candidates.length === 0) return null;
  return candidates[0]!;
}

/**
 * Evaluates all possible line pairs in OCR text and ranks them by MRZ structural quality.
 */
export function extractAllMrzCandidates(ocrText: string): Array<[string, string]> {
  const lines = ocrText
    .split(/[\r\n]+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Clean and prepare individual line candidates
  const lineCandidates: string[] = [];
  for (const raw of lines) {
    // Check if line contains MRZ characters
    const stripped = raw.toUpperCase().replace(/\s+/g, "");
    // Check if line contains 'P<' or 'P' with country code, or digits/chevrons
    const mrzChars = stripped.replace(/[^A-Z0-9<]/g, "");
    if (mrzChars.length >= 25) {
      // If line contains 'P<' somewhere in the middle, slice from 'P<'
      const pIdx = mrzChars.indexOf("P<");
      if (pIdx > 0 && pIdx <= 10) {
        lineCandidates.push(mrzChars.slice(pIdx));
      } else {
        lineCandidates.push(mrzChars);
      }
    }
  }

  const pairs: Array<{ pair: [string, string]; score: number }> = [];

  for (let i = 0; i < lineCandidates.length - 1; i++) {
    const l1 = normaliseMrzLine(lineCandidates[i]!);
    const l2 = normaliseMrzLine(lineCandidates[i + 1]!);

    // Line 1 should ideally start with P or contain <<
    const l1Score = (l1.startsWith("P") ? 30 : 0) + (l1.includes("<<") ? 20 : 0);
    // Line 2 has digits at index 13-18 (DOB) and 21-26 (expiry)
    const l2Dob = l2.slice(13, 19);
    const l2Exp = l2.slice(21, 27);
    const l2Score =
      (/^\d{6}$/.test(fixNumeric(l2Dob)) ? 25 : 0) + (/^\d{6}$/.test(fixNumeric(l2Exp)) ? 25 : 0);

    const total = l1Score + l2Score;
    if (total >= 40) {
      // Also dry-parse to get real MRZ score
      const parsed = parseMrz(l1, l2);
      pairs.push({ pair: [l1, l2], score: total + parsed.confidenceScore });
    }
  }

  // Sort descending by score
  pairs.sort((a, b) => b.score - a.score);

  if (pairs.length > 0) {
    return pairs.map((p) => p.pair);
  }

  // Fallback heuristic if standard pairing found nothing: pick last two lines with >= 30 chars
  const fallback = lineCandidates.filter((c) => c.length >= 30);
  if (fallback.length >= 2) {
    const last2 = fallback.slice(-2);
    return [[normaliseMrzLine(last2[0]!), normaliseMrzLine(last2[1]!)]];
  }

  return [];
}
