/**
 * Tests for the ICAO TD3 MRZ parser, validator, and repair engine.
 *
 * Run with:  bun x vitest run src/lib/passport-mrz.test.ts
 */

import { describe, expect, it } from "vitest";
import {
  computeCheckDigit,
  validateCheckDigit,
  mrzDateToIso,
  isValidMrzDate,
  normaliseMrzLine,
  repairFieldWithCheckDigit,
  scoreMrz,
  parseMrz,
  parseMrzName,
  cleanTrailingFiller,
  cleanWordArtifact,
  extractMrzLines,
  extractAllMrzCandidates,
  fixAlpha,
  fixNumeric,
  nationalityToLabel,
} from "./passport-mrz";

// ---------------------------------------------------------------------------
// Check digit
// ---------------------------------------------------------------------------

describe("computeCheckDigit", () => {
  it("computes correct check digit for passport number (ICAO example)", () => {
    // From ICAO Doc 9303: 'L898902C3' → 6
    expect(computeCheckDigit("L898902C3")).toBe(6);
  });

  it("computes correct check digit for DOB", () => {
    // '740812' → 2
    expect(computeCheckDigit("740812")).toBe(2);
  });

  it("computes correct check digit for all zeros", () => {
    expect(computeCheckDigit("000000")).toBe(0);
  });

  it("computes check digit for filler characters", () => {
    expect(computeCheckDigit("<<<<<<<<<<<<<<")).toBe(0);
  });
});

describe("validateCheckDigit", () => {
  it("returns true for valid check digit", () => {
    expect(validateCheckDigit("L898902C3", "6")).toBe(true);
  });

  it("returns false for invalid check digit", () => {
    expect(validateCheckDigit("L898902C3", "7")).toBe(false);
  });

  it("returns false for non-numeric check digit", () => {
    expect(validateCheckDigit("L898902C3", "X")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Controlled Check-Digit-Driven Auto-Repair
// ---------------------------------------------------------------------------

describe("repairFieldWithCheckDigit", () => {
  it("repairs OCR 'O' to '0' in passport number when check digit matches", () => {
    // 'L898902C3' check digit is 6. Suppose OCR gave 'L8989O2C3' with check digit '6'.
    const badPassport = "L8989O2C3";
    const result = repairFieldWithCheckDigit(badPassport, "6", false);
    expect(result).not.toBeNull();
    expect(result!.repaired).toBe(true);
    expect(result!.value).toBe("L898902C3");
    expect(result!.checkDigit).toBe("6");
  });

  it("repairs OCR check digit itself when '0' was read as 'O'", () => {
    // '000000' check digit is 0. Suppose OCR returned check digit 'O'.
    const result = repairFieldWithCheckDigit("000000", "O", true);
    expect(result).not.toBeNull();
    expect(result!.repaired).toBe(true);
    expect(result!.checkDigit).toBe("0");
  });

  it("repairs DOB with calendar validation", () => {
    // DOB 900521 (check digit 8). Suppose OCR gave 9O0521 with check digit 8.
    const expectedChk = String(computeCheckDigit("900521"));
    const badDob = "9O0521";
    const result = repairFieldWithCheckDigit(badDob, expectedChk, true, isValidMrzDate);
    expect(result).not.toBeNull();
    expect(result!.repaired).toBe(true);
    expect(result!.value).toBe("900521");
  });

  it("rejects repair if it would create an impossible calendar date", () => {
    // If field would produce month 13 or day 32, it should be rejected by validator
    const badDob = "901321"; // Month 13 is invalid
    const result = repairFieldWithCheckDigit(badDob, "5", true, isValidMrzDate);
    expect(result).toBeNull();
  });

  it("returns null when check digit is completely irreconcilable", () => {
    // 'AAAAAA' has check digit 0. A has no alphanumeric confusions, so with check digit 5 it cannot be repaired:
    const result = repairFieldWithCheckDigit("AAAAAA", "5", false);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Date conversion & validation
// ---------------------------------------------------------------------------

describe("mrzDateToIso", () => {
  it("converts a past date correctly (1990)", () => {
    expect(mrzDateToIso("900521")).toBe("1990-05-21");
  });

  it("converts a future expiry date correctly (2030)", () => {
    expect(mrzDateToIso("301115")).toBe("2030-11-15");
  });

  it("returns empty string for invalid input", () => {
    expect(mrzDateToIso("ABCDEF")).toBe("");
    expect(mrzDateToIso("")).toBe("");
    expect(mrzDateToIso("1234")).toBe("");
  });

  it("handles 2000s dates", () => {
    expect(mrzDateToIso("050101")).toBe("2005-01-01");
  });
});

describe("isValidMrzDate", () => {
  it("validates legitimate dates", () => {
    expect(isValidMrzDate("900521")).toBe(true);
    expect(isValidMrzDate("281231")).toBe(true);
  });

  it("invalidates month 00 or > 12", () => {
    expect(isValidMrzDate("900021")).toBe(false);
    expect(isValidMrzDate("901321")).toBe(false);
  });

  it("invalidates day 00 or > 31", () => {
    expect(isValidMrzDate("900500")).toBe(false);
    expect(isValidMrzDate("900532")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// OCR error correction
// ---------------------------------------------------------------------------

describe("fixAlpha", () => {
  it("replaces 0 with O in alpha fields", () => {
    expect(fixAlpha("B0GD")).toBe("BOGD");
    expect(fixAlpha("00A")).toBe("OOA");
  });

  it("replaces 1 with I in alpha fields", () => {
    expect(fixAlpha("1ND")).toBe("IND");
  });

  it("replaces 8 with B in alpha fields", () => {
    expect(fixAlpha("8GD")).toBe("BGD");
  });
});

describe("fixNumeric", () => {
  it("replaces O with 0 in numeric fields", () => {
    expect(fixNumeric("9OO521")).toBe("900521");
  });

  it("replaces I with 1 in numeric fields", () => {
    expect(fixNumeric("9I0521")).toBe("910521");
  });

  it("replaces B with 8 in numeric fields", () => {
    expect(fixNumeric("9B0521")).toBe("980521");
  });

  it("replaces Z with 2 in numeric fields", () => {
    expect(fixNumeric("9Z0521")).toBe("920521");
  });

  it("replaces S with 5 in numeric fields", () => {
    expect(fixNumeric("9S0521")).toBe("950521");
  });
});

// ---------------------------------------------------------------------------
// MRZ line normalisation & line reconstruction
// ---------------------------------------------------------------------------

describe("normaliseMrzLine", () => {
  it("pads short lines to 44 chars with <", () => {
    const short = "P<BGD";
    const result = normaliseMrzLine(short);
    expect(result).toHaveLength(44);
    expect(result.startsWith("P<BGD")).toBe(true);
    expect(result.slice(5)).toBe("<".repeat(39));
  });

  it("removes whitespace from line", () => {
    const withSpaces = "P <BGD RAHMAN<<AYESHA";
    const result = normaliseMrzLine(withSpaces);
    expect(result).not.toContain(" ");
  });

  it("replaces bracket/chevron misreadings with <", () => {
    const withBrackets = "P<BGD(RAHMAN<<AYESHA[FATIMA]";
    const result = normaliseMrzLine(withBrackets);
    expect(result).toContain("<");
    expect(result).not.toContain("(");
    expect(result).not.toContain("[");
  });

  it("cleans isolated noise characters inside chevron runs", () => {
    const noisyChevrons = "P<BGDRAHMAN<<<<<K<<<<<<<<<<<<<<<<<<<<<<<<<<<";
    const result = normaliseMrzLine(noisyChevrons);
    expect(result).not.toContain("K");
  });

  it("truncates lines longer than 44 chars", () => {
    const long = "A".repeat(50);
    expect(normaliseMrzLine(long)).toHaveLength(44);
  });
});

// ---------------------------------------------------------------------------
// Full MRZ parsing & confidence evaluation
// ---------------------------------------------------------------------------

describe("parseMrz — valid Bangladeshi passport (safe fabricated test data)", () => {
  const passportNum = "BX0123456";
  const passportCheck = String(computeCheckDigit(passportNum));
  const dob = "900521";
  const dobCheck = String(computeCheckDigit(dob));
  const expiry = "301115";
  const expiryCheck = String(computeCheckDigit(expiry));
  const personal = "<<<<<<<<<<<<<<";
  const personalCheck = String(computeCheckDigit(personal));

  const line2Base =
    passportNum +
    passportCheck +
    "BGD" +
    dob +
    dobCheck +
    "F" +
    expiry +
    expiryCheck +
    personal +
    personalCheck;
  const compositeVal = line2Base.slice(0, 10) + line2Base.slice(13, 20) + line2Base.slice(21, 43);
  const compositeCheck = String(computeCheckDigit(compositeVal));
  const line2 = line2Base + compositeCheck;

  const line1 = ("P<BGDRAHMAN<<AYESHA<FATIMA" + "<".repeat(44)).slice(0, 44);

  it("parses correctly with HIGH confidence", () => {
    const result = parseMrz(line1, line2);
    expect(result.ok).toBe(true);
    expect(result.confidence).toBe("HIGH");
    expect(result.lowConfidence).toBe(false);
    expect(result.surname).toBe("RAHMAN");
    expect(result.givenNames).toBe("AYESHA FATIMA");
    expect(result.passportNumber).toBe(passportNum);
    expect(result.nationality).toBe("Bangladeshi");
    expect(result.dateOfBirth).toBe("1990-05-21");
    expect(result.sex).toBe("F");
    expect(result.expiryDate).toBe("2030-11-15");
    expect(result.errors).toHaveLength(0);
  });
});

describe("parseMrz — auto-repairing OCR error in passport number", () => {
  // Correct passport is BX0123456, check digit is computed
  const truePassportNum = "BX0123456";
  const passportCheck = String(computeCheckDigit(truePassportNum));
  const dob = "900521";
  const dobCheck = String(computeCheckDigit(dob));
  const expiry = "301115";
  const expiryCheck = String(computeCheckDigit(expiry));
  const personal = "<<<<<<<<<<<<<<";
  const personalCheck = String(computeCheckDigit(personal));

  // Simulate OCR confusion: '0' at index 2 misread as 'O'
  const noisyPassportNum = "BXO123456";
  const line2Base =
    noisyPassportNum +
    passportCheck +
    "BGD" +
    dob +
    dobCheck +
    "F" +
    expiry +
    expiryCheck +
    personal +
    personalCheck;
  const line2 = (line2Base + "<".repeat(44)).slice(0, 44);
  const line1 = ("P<BGDRAHMAN<<AYESHA" + "<".repeat(44)).slice(0, 44);

  it("successfully repairs OCR 'O' back to '0' using check digit", () => {
    const result = parseMrz(line1, line2);
    expect(result.ok).toBe(true);
    expect(result.passportNumber).toBe(truePassportNum);
    expect(result.repairedFields.length).toBeGreaterThan(0);
  });
});

describe("parseMrz — unrepairable passport check digit reports error", () => {
  const line1 = ("P<GBRSMITH<<JOHN<WILLIAM" + "<".repeat(44)).slice(0, 44);
  // Deliberately wrong check digit and irreconcilable passport number
  const line2 = (
    "AB9999999" +
    "3" +
    "GBR" +
    "800101" +
    String(computeCheckDigit("800101")) +
    "M" +
    "250101" +
    String(computeCheckDigit("250101")) +
    "<<<<<<<<<<<<<<" +
    "0" +
    "0"
  ).slice(0, 44);

  it("reports an error for irreconcilable passport check digit", () => {
    const result = parseMrz(line1, line2);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("Passport number check digit"))).toBe(true);
  });
});

describe("parseMrz — multiple given names", () => {
  const passportNum = "CD9876543";
  const passportCheck = String(computeCheckDigit(passportNum));
  const dob = "851230";
  const dobCheck = String(computeCheckDigit(dob));
  const expiry = "280630";
  const expiryCheck = String(computeCheckDigit(expiry));
  const personal = "<<<<<<<<<<<<<<";
  const personalCheck = String(computeCheckDigit(personal));
  const line2Base =
    passportNum +
    passportCheck +
    "IND" +
    dob +
    dobCheck +
    "M" +
    expiry +
    expiryCheck +
    personal +
    personalCheck;
  const compositeVal = line2Base.slice(0, 10) + line2Base.slice(13, 20) + line2Base.slice(21, 43);
  const compositeCheck = String(computeCheckDigit(compositeVal));
  const line2 = line2Base + compositeCheck;
  const line1 = ("P<INDKUMAR<<RAJESH<KUMAR<MOHAN" + "<".repeat(44)).slice(0, 44);

  it("parses all given names correctly", () => {
    const result = parseMrz(line1, line2);
    expect(result.surname).toBe("KUMAR");
    expect(result.givenNames).toContain("RAJESH");
    expect(result.givenNames).toContain("KUMAR");
    expect(result.givenNames).toContain("MOHAN");
  });
});

describe("parseMrz — ICAO official Doc 9303 TD3 sample", () => {
  // Official ICAO sample
  const line1 = "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<";
  const line2 = "L898902C36UTO7408122F1204159ZE184226B<<<<<10";

  it("parses official ICAO test passport completely", () => {
    const result = parseMrz(line1, line2);
    expect(result.ok).toBe(true);
    expect(result.confidence).toBe("HIGH");
    expect(result.surname).toBe("ERIKSSON");
    expect(result.givenNames).toBe("ANNA MARIA");
    expect(result.passportNumber).toBe("L898902C3");
    expect(result.dateOfBirth).toBe("1974-08-12");
    expect(result.expiryDate).toBe("2012-04-15");
    expect(result.sex).toBe("F");
  });
});

// ---------------------------------------------------------------------------
// Candidate extraction from noisy OCR output
// ---------------------------------------------------------------------------

describe("extractMrzLines & extractAllMrzCandidates", () => {
  it("finds MRZ lines in realistic OCR output with surrounded text", () => {
    const ocrOutput = `
      PEOPLE'S REPUBLIC OF BANGLADESH
      PASSPORT / PASSEPORT
      Type/Type: P Country Code: BGD
      Surname / Nom:
      RAHMAN
      Given Name(s) / Prenoms:
      AYESHA FATIMA
      Date of birth: 21 MAY 1990

      P<BGDRAHMAN<<AYESHA<FATIMA<<<<<<<<<<<<<<<<<<
      BX01234566BGD9005218F3011152<<<<<<<<<<<<<<<4
    `;
    const result = extractMrzLines(ocrOutput);
    expect(result).not.toBeNull();
    expect(result![0]).toContain("RAHMAN");
    expect(result![1]).toContain("BX0123456");
  });

  it("handles OCR output with leading noise prepended to line 1", () => {
    const ocrOutput = `
      DOC123P<BGDRAHMAN<<AYESHA<FATIMA<<<<<<<<<<<<<<<<<<
      BX01234566BGD9005218F3011152<<<<<<<<<<<<<<<4
    `;
    const candidates = extractAllMrzCandidates(ocrOutput);
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0]![0].startsWith("P<BGD")).toBe(true);
  });

  it("returns null when no MRZ pattern is present", () => {
    const ocrOutput = `
      This is just a regular document.
      No machine readable zone lines.
      Total failure scenario.
    `;
    expect(extractMrzLines(ocrOutput)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Nationality lookup
// ---------------------------------------------------------------------------

describe("nationalityToLabel", () => {
  it("maps BGD to Bangladeshi", () => {
    expect(nationalityToLabel("BGD")).toBe("Bangladeshi");
  });

  it("maps GBR to British", () => {
    expect(nationalityToLabel("GBR")).toBe("British");
  });

  it("maps USA to American", () => {
    expect(nationalityToLabel("USA")).toBe("American");
  });

  it("falls back to the code for unknown countries", () => {
    expect(nationalityToLabel("XYZ")).toBe("XYZ");
  });

  it("handles filler chars in code", () => {
    expect(nationalityToLabel("BGD<<")).toBe("Bangladeshi");
  });
});

// ---------------------------------------------------------------------------
// MRZ Name Normalization & Field Extraction (ICAO TD3)
// ---------------------------------------------------------------------------

describe("parseMrzName — Standard ICAO TD3 Name Extraction", () => {
  it("extracts RAHMAN and MD ZAHIDUL correctly", () => {
    const res = parseMrzName("RAHMAN<<MD<ZAHIDUL<<<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("RAHMAN");
    expect(res.givenName).toBe("MD ZAHIDUL");
    expect(res.givenNames).toBe("MD ZAHIDUL");
  });

  it("extracts KHAN and MOHAMMAD ABDULLAH correctly", () => {
    const res = parseMrzName("KHAN<<MOHAMMAD<ABDULLAH<<<<<<<<<<<<<<");
    expect(res.surname).toBe("KHAN");
    expect(res.givenName).toBe("MOHAMMAD ABDULLAH");
    expect(res.givenNames).toBe("MOHAMMAD ABDULLAH");
  });

  it("extracts AHMED and MD RAHIM correctly", () => {
    const res = parseMrzName("AHMED<<MD<RAHIM<<<<<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("AHMED");
    expect(res.givenName).toBe("MD RAHIM");
    expect(res.givenNames).toBe("MD RAHIM");
  });
});

describe("parseMrzName — Preserving Legitimate Names containing K and L", () => {
  it("preserves KHALIL and MD ALI (K and L in legitimate names)", () => {
    const res = parseMrzName("KHALIL<<MD<ALI<<<<<<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("KHALIL");
    expect(res.givenName).toBe("MD ALI");
  });

  it("preserves MALIK and KAMAL (legitimate names ending in K and L)", () => {
    const res = parseMrzName("MALIK<<KAMAL<<<<<<<<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("MALIK");
    expect(res.givenName).toBe("KAMAL");
  });

  it("preserves SMITH and MARK (legitimate name ending in K)", () => {
    const res = parseMrzName("SMITH<<MARK<<<<<<<<<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("SMITH");
    expect(res.givenName).toBe("MARK");
  });

  it("preserves LIMA and KABIR (legitimate names with L and K)", () => {
    const res = parseMrzName("LIMA<<KABIR<<<<<<<<<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("LIMA");
    expect(res.givenName).toBe("KABIR");
  });

  it("preserves PAUL and CLARK (legitimate names ending in L and K)", () => {
    const res = parseMrzName("PAUL<<CLARK<<<<<<<<<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("PAUL");
    expect(res.givenName).toBe("CLARK");
  });
});

describe("parseMrzName — OCR Chevron Artifact Recovery (K, L, KL, LK)", () => {
  it("recovers from corrupted first chevron K< (does NOT produce RAHMANK)", () => {
    const res = parseMrzName("RAHMANK<MD<ZAHIDUL<<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("RAHMAN");
    expect(res.givenName).toBe("MD ZAHIDUL");
  });

  it("recovers from corrupted first chevron L< (does NOT produce RAHMANL)", () => {
    const res = parseMrzName("RAHMANL<MD<ZAHIDUL<<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("RAHMAN");
    expect(res.givenName).toBe("MD ZAHIDUL");
  });

  it("recovers from corrupted separator <KL< (does NOT produce RAHMAN KL)", () => {
    const res = parseMrzName("RAHMAN<KL<MD<ZAHIDUL<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("RAHMAN");
    expect(res.givenName).toBe("MD ZAHIDUL");
  });

  it("recovers from corrupted separator KL< (does NOT produce RAHMAN KL)", () => {
    const res = parseMrzName("RAHMANKL<MD<ZAHIDUL<<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("RAHMAN");
    expect(res.givenName).toBe("MD ZAHIDUL");
  });

  it("recovers from corrupted separator <K< (does NOT produce K MD ZAHIDUL)", () => {
    const res = parseMrzName("RAHMAN<K<MD<ZAHIDUL<<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("RAHMAN");
    expect(res.givenName).toBe("MD ZAHIDUL");
  });

  it("cleans trailing chevron artifact <K (does NOT produce MD ZAHIDUL K)", () => {
    const res = parseMrzName("RAHMAN<<MD<ZAHIDUL<K<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("RAHMAN");
    expect(res.givenName).toBe("MD ZAHIDUL");
  });

  it("cleans trailing chevron artifact <L (does NOT produce MD ZAHIDUL L)", () => {
    const res = parseMrzName("RAHMAN<<MD<ZAHIDUL<L<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("RAHMAN");
    expect(res.givenName).toBe("MD ZAHIDUL");
  });

  it("cleans trailing chevron artifact <KL (does NOT produce MD ZAHIDUL KL)", () => {
    const res = parseMrzName("RAHMAN<<MD<ZAHIDUL<KL<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("RAHMAN");
    expect(res.givenName).toBe("MD ZAHIDUL");
  });

  it("cleans direct word-attached chevron artifact ZAHIDULK", () => {
    const res = parseMrzName("RAHMAN<<MD<ZAHIDULK<<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("RAHMAN");
    expect(res.givenName).toBe("MD ZAHIDUL");
  });

  it("cleans direct word-attached chevron artifact ZAHIDULL", () => {
    const res = parseMrzName("RAHMAN<<MD<ZAHIDULL<<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("RAHMAN");
    expect(res.givenName).toBe("MD ZAHIDUL");
  });

  it("works when passed a full Line 1 string with P<BGD prefix", () => {
    const res = parseMrzName("P<BGDRAHMANK<MD<ZAHIDUL<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("RAHMAN");
    expect(res.givenName).toBe("MD ZAHIDUL");
  });
});

describe("parseMrz — Integration with full passport lines", () => {
  // Fabricated test line 2 with valid check digits
  const passportNum = "BX0123456";
  const passportCheck = String(computeCheckDigit(passportNum));
  const dob = "900521";
  const dobCheck = String(computeCheckDigit(dob));
  const expiry = "301115";
  const expiryCheck = String(computeCheckDigit(expiry));
  const personal = "<<<<<<<<<<<<<<";
  const personalCheck = String(computeCheckDigit(personal));
  const line2Base =
    passportNum +
    passportCheck +
    "BGD" +
    dob +
    dobCheck +
    "F" +
    expiry +
    expiryCheck +
    personal +
    personalCheck;
  const compositeVal = line2Base.slice(0, 10) + line2Base.slice(13, 20) + line2Base.slice(21, 43);
  const compositeCheck = String(computeCheckDigit(compositeVal));
  const line2 = line2Base + compositeCheck;

  it("correctly extracts names from Line 1 having corrupted first chevron K<", () => {
    const line1 = ("P<BGDRAHMANK<MD<ZAHIDUL" + "<".repeat(44)).slice(0, 44);
    const result = parseMrz(line1, line2);
    expect(result.ok).toBe(true);
    expect(result.surname).toBe("RAHMAN");
    expect(result.givenNames).toBe("MD ZAHIDUL");
  });

  it("correctly extracts names from Line 1 having trailing chevron noise <K", () => {
    const line1 = ("P<BGDRAHMAN<<MD<ZAHIDUL<K" + "<".repeat(44)).slice(0, 44);
    const result = parseMrz(line1, line2);
    expect(result.ok).toBe(true);
    expect(result.surname).toBe("RAHMAN");
    expect(result.givenNames).toBe("MD ZAHIDUL");
  });

  it("preserves legitimate names ending in K/L in full parseMrz", () => {
    const line1 = ("P<BGDMALIK<<KHALIL<ALI" + "<".repeat(44)).slice(0, 44);
    const result = parseMrz(line1, line2);
    expect(result.ok).toBe(true);
    expect(result.surname).toBe("MALIK");
    expect(result.givenNames).toBe("KHALIL ALI");
  });

  // -------------------------------------------------------------------------
  // Concrete regression tests from user specification (Section 12 & 16)
  // -------------------------------------------------------------------------

  it("extracts exact user sample passport: HOSAIN ROBIN in uppercase without any K/L contamination", () => {
    const line1 = "P<BGDHOSAIN<<ROBIN<<<<<<<<<<<<<<<<<<<<<<<<";
    const line2 = "A128505838BGD9501016M33102854601736467<<<<66";

    const result = parseMrz(line1, line2);

    expect(result.ok).toBe(true);
    expect(result.confidence).toBe("HIGH");
    expect(result.surname).toBe("HOSAIN");
    expect(result.givenNames).toBe("ROBIN");
    expect(result.nationality).toBe("Bangladeshi");
    expect(result.passportNumber).toBe("A12850583");
    expect(result.dateOfBirth).toBe("1995-01-01");
    expect(result.sex).toBe("M");
    expect(result.expiryDate).toBe("2033-10-28");
    expect(result.errors).toHaveLength(0);

    // Negative assertions to ensure no K/L contamination
    expect(result.givenNames).toBe("ROBIN");
    expect(result.givenNames).not.toBe("KROBIN");
    expect(result.givenNames).not.toContain("<");
  });

  it("handles OCR erroneous candidate with KROBIN (Section 12 regression)", () => {
    // If OCR erroneously yields KROBIN due to chevron + R junction
    const line1Erroneous = "P<BGDHOSAIN<<KROBIN<<<<<<<<<<<<<<<<<<<<<<<";
    const line2 = "A128505838BGD9501016M33102854601736467<<<<66";

    const result = parseMrz(line1Erroneous, line2);

    expect(result.surname).toBe("HOSAIN");
    expect(result.givenNames).toBe("ROBIN");
    expect(result.givenNames).not.toBe("KROBIN");
  });

  it("preserves legitimate names starting with K: KHALIL and KAMAL (Section 12 regression)", () => {
    const line1 = "P<BGDKHALIL<<KAMAL<<<<<<<<<<<<<<<<<<<<<<<";
    const line2 = "A128505838BGD9501016M33102854601736467<<<<66";

    const result = parseMrz(line1, line2);

    expect(result.surname).toBe("KHALIL");
    expect(result.givenNames).toBe("KAMAL");
  });

  it("correctly extracts RAHMAN and MD ZAHIDUL (Section 12 regression)", () => {
    const line1 = "P<BGDRAHMAN<<MD<ZAHIDUL<<<<<<<<<<<<<<<<<<<";
    const line2 = "A128505838BGD9501016M33102854601736467<<<<66";

    const result = parseMrz(line1, line2);

    expect(result.surname).toBe("RAHMAN");
    expect(result.givenNames).toBe("MD ZAHIDUL");
  });

  it("handles OCR noise with trailing K/L filler contamination on Robin Hosain passport", () => {
    // Simulates noisy OCR output where chevrons were misread as isolated K/L characters and clusters
    const line1Noise = "P<BGDHOSAIN<<ROBIN<K<K<K<L<LLLLLLLLLLKL<<<<";
    const nameRes = parseMrzName(line1Noise);

    expect(nameRes.surname).toBe("HOSAIN");
    expect(nameRes.givenName).toBe("ROBIN");
    expect(nameRes.givenNames).toBe("ROBIN");
  });

  it("handles OCR noise with spaces in trailing filler zone", () => {
    const line1Noise = "P<BGDHOSAIN<<ROBIN K K K K L LLLLLLLLLKL";
    const nameRes = parseMrzName(line1Noise);

    expect(nameRes.surname).toBe("HOSAIN");
    expect(nameRes.givenName).toBe("ROBIN");
  });

  it("handles Section 14 regression: P<BGDHOSAIN<<ROBIN<<<<<<<<<<<<<<<<<<<<<<<<", () => {
    const res = parseMrzName("P<BGDHOSAIN<<ROBIN<<<<<<<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("HOSAIN");
    expect(res.givenName).toBe("ROBIN");
  });

  it("handles Section 14 regression: P<BGDKHALIL<<MD<ROBIN<<<<<<<<<<<<<<<<<<<<<", () => {
    const res = parseMrzName("P<BGDKHALIL<<MD<ROBIN<<<<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("KHALIL");
    expect(res.givenName).toBe("MD ROBIN");
  });

  it("handles Section 14 regression: P<BGDRAHMAN<<MD<ZAHIDUL<<<<<<<<<<<<<<<<<<<", () => {
    const res = parseMrzName("P<BGDRAHMAN<<MD<ZAHIDUL<<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("RAHMAN");
    expect(res.givenName).toBe("MD ZAHIDUL");
  });

  it("handles Section 14 regression: P<BGDALAM<<KAMAL<<<<<<<<<<<<<<<<<<<<<<<<<<<", () => {
    const res = parseMrzName("P<BGDALAM<<KAMAL<<<<<<<<<<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("ALAM");
    expect(res.givenName).toBe("KAMAL");
  });

  it("preserves legitimate names CLARK and MARK", () => {
    const res = parseMrzName("P<BGDCLARK<<MARK<<<<<<<<<<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("CLARK");
    expect(res.givenName).toBe("MARK");
  });

  it("preserves legitimate names PAUL and KABIR", () => {
    const res = parseMrzName("P<BGDPAUL<<KABIR<<<<<<<<<<<<<<<<<<<<<<<<<<<");
    expect(res.surname).toBe("PAUL");
    expect(res.givenName).toBe("KABIR");
  });

  describe("Mandatory Uppercase Enforcement (Section 10 & 12)", () => {
    it("strictly returns uppercase for HOSAIN and ROBIN, never titlecase or lowercase", () => {
      const res = parseMrzName("P<BGDHOSAIN<<ROBIN<<<<<<<<<<<<<<<<<<<<<<<<");
      expect(res.surname).toBe("HOSAIN");
      expect(res.givenName).toBe("ROBIN");
      expect(res.surname).not.toBe("Hosain");
      expect(res.surname).not.toBe("hosain");
      expect(res.givenName).not.toBe("Robin");
      expect(res.givenName).not.toBe("robin");
    });

    it("strictly returns uppercase for multiple names: MOHAMMAD ABDULLAH", () => {
      const res = parseMrzName("P<BGDKHAN<<MOHAMMAD<ABDULLAH<<<<<<<<<<<<<<");
      expect(res.surname).toBe("KHAN");
      expect(res.givenName).toBe("MOHAMMAD ABDULLAH");
    });

    it("strictly returns uppercase for RAHMAN and MD ZAHIDUL", () => {
      const res = parseMrzName("P<BGDRAHMAN<<MD<ZAHIDUL<<<<<<<<<<<<<<<<<<<");
      expect(res.surname).toBe("RAHMAN");
      expect(res.givenName).toBe("MD ZAHIDUL");
    });

    it("normalizes lowercase/mixed-case input to UPPERCASE", () => {
      const res = parseMrzName("p<bgdhosain<<robin<<<<<<<<<<<<<<<<<<<<<<<<");
      expect(res.surname).toBe("HOSAIN");
      expect(res.givenName).toBe("ROBIN");
    });
  });
});
