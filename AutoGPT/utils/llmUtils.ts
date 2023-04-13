import { Config } from './config';
import { getAPIKey } from './apiKey';

export type LLMMessage =
  | { role: "system"; content: string; }
  | { role: "assistant"; content: string; }
  | { role: "user"; content: string; };

export type LLMModel =
  | "gpt-3.5-turbo"
  | "gpt-3.5-turbo-0301"
  | "gpt-4"
  | "gpt-4-32k";

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
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

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

  return resBody.choices[0].message.content as string;
}

export interface CallAIFunctionArgs {
    function: string;
    args: any[];
    description: string;
    model?: LLMModel;
}

export async function callAIFunction({
    function: aiFunction,
    args,
    description,
    model = Config.smart_llm_model,
}: CallAIFunctionArgs): Promise<string> {
    args = args.map(arg => (arg !== null && arg !== undefined ? `${String(arg)}` : 'None'));
    const argsString = args.join(', ');

    const messages: LLMMessage[] = [
        {
            role: 'system',
            content: `You are now the following typescript function: \`\`\`# ${description}\n${aiFunction}\`\`\`\n\nOnly respond with your \`return\` value.`,
        },
        { role: 'user', content: argsString },
    ];

    const response = callLLMChatCompletion(
        messages,
        model,
        0 /* temperature */,
    );

    return response;
}
