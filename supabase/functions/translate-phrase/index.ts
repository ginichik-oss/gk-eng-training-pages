const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type TranslatePayload = {
  text?: string;
  sourceQuestionJp?: string;
  sourceQuestionEn?: string;
  context?: string;
  register?: string;
  confidentiality?: string;
  policy?: string;
  sanitized?: boolean;
  confirmed?: boolean;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const user = await verifySupabaseUser(request.headers.get("Authorization") || "");
  if (!user) {
    return jsonResponse({ error: "Sign in required" }, 401);
  }

  let payload: TranslatePayload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const text = String(payload.text || "").trim();
  if (!text) {
    return jsonResponse({ error: "Japanese text is required" }, 400);
  }
  if (text.length > 4000) {
    return jsonResponse({ error: "Text is too long for one draft" }, 413);
  }

  const policy = ["strict", "balanced", "open"].includes(String(payload.policy))
    ? String(payload.policy)
    : "balanced";
  const confidentiality = String(payload.confidentiality || "internal");
  const policyError = enforcePolicy(confidentiality, policy, Boolean(payload.confirmed));
  if (policyError) {
    return jsonResponse({ error: policyError }, 403);
  }

  const openAiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openAiKey) {
    return jsonResponse({ error: "OPENAI_API_KEY is not configured" }, 500);
  }

  const result = await createOpenAiDraft(openAiKey, payload, text, confidentiality);
  if (!result.ok) {
    return jsonResponse({ error: result.error }, 502);
  }

  const outputText = extractOutputText(result.data);
  const parsed = parseJsonObject(outputText);
  return jsonResponse({
    en: String(parsed.en || outputText || "").trim(),
    whyBetter: String(parsed.whyBetter || parsed.why_better || "").trim(),
    tags: Array.isArray(parsed.tags) ? parsed.tags.map((tag) => String(tag)).slice(0, 6) : [],
    model: result.model,
  });
});

async function createOpenAiDraft(
  openAiKey: string,
  payload: TranslatePayload,
  text: string,
  confidentiality: string,
) {
  const models = modelCandidates();
  let lastError = "";
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          store: false,
          max_output_tokens: 700,
          input: [
            {
              role: "system",
              content: [
                {
                  type: "input_text",
                  text:
                    "You are a business English coach for a Japan-focused private equity professional. Draft polished, natural English for LP and investor conversations. Preserve placeholders such as [REDACTED_1], [AMOUNT], and [EMAIL] exactly. Do not add new facts. Keep confidential disclosures appropriately limited. Return JSON only with keys en, whyBetter, and tags.",
                },
              ],
            },
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: JSON.stringify({
                    japaneseIntent: text,
                    sourceQuestionJp: payload.sourceQuestionJp || "",
                    sourceQuestionEn: payload.sourceQuestionEn || "",
                    context: payload.context || "LP meeting",
                    register: payload.register || "institutional",
                    confidentiality,
                    sanitized: Boolean(payload.sanitized),
                  }),
                },
              ],
            },
          ],
        }),
      });
      const data = await response.json().catch(() => null);
      if (response.ok) return { ok: true, data, model };
      lastError = data?.error?.message || `OpenAI request failed: ${response.status}`;
      if (!isRetryableOpenAiStatus(response.status)) break;
      await sleep(700);
    }
  }
  return { ok: false, error: lastError || "OpenAI request failed" };
}

function modelCandidates() {
  const configured = Deno.env.get("OPENAI_MODEL") || "gpt-5.5";
  const models = configured
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);
  if (!models.includes("gpt-5.5")) models.push("gpt-5.5");
  return [...new Set(models)];
}

function isRetryableOpenAiStatus(status: number) {
  return [408, 409, 429, 500, 502, 503, 504].includes(status);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function enforcePolicy(confidentiality: string, policy: string, confirmed: boolean) {
  if (policy === "strict" && confidentiality === "highly confidential") {
    return "Strict policy blocks highly confidential AI drafts";
  }
  if ((confidentiality === "confidential" || confidentiality === "highly confidential") && !confirmed) {
    return "Confirmation required for confidential AI drafts";
  }
  return "";
}

async function verifySupabaseUser(authHeader: string) {
  if (!authHeader.startsWith("Bearer ")) return null;
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: authHeader,
    },
  });
  if (!response.ok) return null;
  return response.json();
}

function extractOutputText(data: any) {
  if (typeof data?.output_text === "string") return data.output_text;
  if (!Array.isArray(data?.output)) return "";
  return data.output
    .flatMap((item: any) => (Array.isArray(item?.content) ? item.content : []))
    .map((content: any) => content?.text || "")
    .join("")
    .trim();
}

function parseJsonObject(text: string) {
  const cleaned = String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return {};
      }
    }
    return {};
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
