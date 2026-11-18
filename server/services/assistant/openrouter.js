// OpenRouter client for the shop assistant.
//
// Separate key from the help chatbot (chatbot/): ASSISTANT_API_KEY.
// OpenRouter speaks the OpenAI chat-completions dialect, so this is a thin
// fetch wrapper — no SDK needed on Node 22+.
require("dotenv").config();

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const REQUEST_TIMEOUT_MS = Number(process.env.ASSISTANT_TIMEOUT_MS || 30000);

// Thrown when the assistant cannot answer for an infrastructure reason.
// `userMessage` is safe to show a shopper; `cause` stays in the server log.
class AssistantUnavailableError extends Error {
  constructor(userMessage, cause) {
    super(cause || userMessage);
    this.name = "AssistantUnavailableError";
    this.userMessage = userMessage;
  }
}

const friendlyFor = (status, body) => {
  if (status === 401 || status === 403) return "The shopping assistant isn't configured correctly right now. Please browse the shop meanwhile.";
  if (status === 402) return "The shopping assistant is out of credit at the moment. Please browse the shop meanwhile.";
  if (status === 429) return "The shopping assistant is busy right now. Please try again in a few seconds.";
  if (status >= 500) return "The shopping assistant is having trouble right now. Please try again in a moment.";
  return `The shopping assistant couldn't answer that (${status}${body ? `: ${String(body).slice(0, 120)}` : ""}).`;
};

/**
 * One chat-completions call.
 * @param {object[]} messages OpenAI-format messages
 * @param {object[]} [tools] OpenAI-format tool definitions
 * @returns {Promise<{message: object, usage: object, model: string}>}
 */
async function chat({ messages, tools, temperature = 0.3, maxTokens = 800 }) {
  const apiKey = process.env.ASSISTANT_API_KEY;
  if (!apiKey) {
    throw new AssistantUnavailableError(
      "The shopping assistant isn't switched on yet.",
      "ASSISTANT_API_KEY is not set"
    );
  }

  const primary = process.env.ASSISTANT_MODEL || "openai/gpt-6-luna";
  const fallback = process.env.ASSISTANT_FALLBACK_MODEL;

  const body = {
    model: primary,
    messages,
    temperature,
    max_tokens: maxTokens,
    // OpenRouter retries the next model itself if the first one errors out.
    ...(fallback ? { models: [primary, fallback] } : {}),
    // Only route to providers that actually implement the parameters we send
    // (tool calling); otherwise a provider can silently drop `tools`.
    ...(tools?.length ? { tools, tool_choice: "auto", provider: { require_parameters: true } } : {}),
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // OpenRouter attribution headers (optional but recommended).
        "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
        "X-Title": "MonoFit Shop Assistant",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new AssistantUnavailableError(
        "The shopping assistant took too long to answer. Please try again.",
        `timeout after ${REQUEST_TIMEOUT_MS}ms`
      );
    }
    throw new AssistantUnavailableError(
      "The shopping assistant is unreachable right now. Please try again in a moment.",
      err.message
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new AssistantUnavailableError(friendlyFor(response.status, text), `${response.status} ${text}`);
  }

  const data = await response.json();
  // OpenRouter reports upstream provider failures inside a 200 body too.
  if (data.error) {
    throw new AssistantUnavailableError(
      friendlyFor(data.error.code || 500, data.error.message),
      JSON.stringify(data.error)
    );
  }
  const message = data.choices?.[0]?.message;
  if (!message) {
    throw new AssistantUnavailableError(
      "The shopping assistant gave an empty answer. Please try again.",
      JSON.stringify(data).slice(0, 300)
    );
  }
  return { message, usage: data.usage || {}, model: data.model || primary };
}

module.exports = { chat, AssistantUnavailableError };
