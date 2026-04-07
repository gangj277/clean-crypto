const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  model?: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: {
    type: "json_schema";
    json_schema: {
      name: string;
      strict: boolean;
      schema: Record<string, unknown>;
    };
  };
}

export async function chat(options: ChatOptions): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  const payload: Record<string, unknown> = {
    model: options.model ?? "google/gemini-2.5-flash",
    messages: options.messages,
    temperature: options.temperature ?? 0.15,
    max_tokens: options.maxTokens ?? 4096,
  };

  if (options.responseFormat) {
    payload.response_format = options.responseFormat;
  }

  const resp = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://cleancrypto.kr",
      "X-OpenRouter-Title": "Clean Crypto",
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenRouter ${resp.status}: ${err}`);
  }

  const data = await resp.json();
  return data.choices[0].message.content;
}
