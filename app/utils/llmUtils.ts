import { getAPIKey } from "./apiKey";

export type LLMMessage =
  | { role: "system"; content: string; }
  | { role: "assistant"; content: string; }
  | { role: "user"; content: string; };

export type LLMModel =
  | "gpt-3.5-turbo"
  | "gpt-3.5-turbo-0301"
  | "gpt-4"
  | "gpt-4-0314";

export async function callLLMChatCompletion(
  messages: LLMMessage[],
  model: LLMModel,
  temperature?: number,
  maxTokens?: number
) {
  const reqBody = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  const apiKey = getAPIKey();
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${apiKey}`);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify(reqBody),
  });

  if (response.status !== 200) {
    const errorText = await response.text();
    console.error("Error calling OpenAI service", response.status, errorText);
    return `Error calling API with status code ${response.status} and message "${errorText}"`;
  }

  const resBody = await response.json();

  return resBody.data.choices[0].message as string;
}
