import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({ image: z.string().min(32).max(8_000_000) });

export type PassportScanResult = {
  first: string;
  last: string;
  dob: string;
  passport: string;
  nationality: string;
  expiry: string;
  sex: string;
};

const empty: PassportScanResult = {
  first: "",
  last: "",
  dob: "",
  passport: "",
  nationality: "",
  expiry: "",
  sex: "",
};

export const scanPassport = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }): Promise<PassportScanResult> => {
    const key = process.env["AI_API_KEY"];
    if (!key) throw new Error("Passport scanning is unavailable right now.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You read machine-readable travel documents. Extract fields exactly as printed. Use ISO dates (YYYY-MM-DD). If a field is unreadable return an empty string. Reply with the tool call only.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract the passport holder details from this passport photo.",
              },
              { type: "image_url", image_url: { url: data.image } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "passport_fields",
              description: "Structured passport holder fields",
              parameters: {
                type: "object",
                properties: {
                  first: { type: "string", description: "Given name(s)" },
                  last: { type: "string", description: "Surname" },
                  dob: { type: "string", description: "Date of birth YYYY-MM-DD" },
                  passport: { type: "string", description: "Passport number" },
                  nationality: { type: "string" },
                  expiry: { type: "string", description: "Expiry date YYYY-MM-DD" },
                  sex: { type: "string" },
                },
                required: ["first", "last", "dob", "passport"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "passport_fields" } },
      }),
    });

    if (res.status === 429)
      throw new Error("Too many scans right now. Please try again in a moment.");
    if (res.status === 402)
      throw new Error("Scanning credits exhausted. Enter the details manually.");
    if (!res.ok) throw new Error("Could not read that passport image.");

    const json = (await res.json()) as {
      choices?: { message?: { tool_calls?: { function?: { arguments?: string } }[] } }[];
    };
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("No passport details found in that image.");
    const parsed = JSON.parse(args) as Partial<PassportScanResult>;
    const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    return {
      ...empty,
      first: clean(parsed.first),
      last: clean(parsed.last),
      dob: clean(parsed.dob),
      passport: clean(parsed.passport).toUpperCase(),
      nationality: clean(parsed.nationality),
      expiry: clean(parsed.expiry),
      sex: clean(parsed.sex),
    };
  });
