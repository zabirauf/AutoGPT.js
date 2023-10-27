import { getAPIKey } from './apiKey';
import type { LLMMessage, LLMModel } from "./types";

export interface CallLLMChatCompletionArgs {
  messages: LLMMessage[];
  model: LLMModel;
  functions?: {
    name: string;
    description: string;
    parameters: { [key: string]: any };
  }[];
  temperature?: number;
  maxTokens?: number;
}

export enum CallLLMChatCompletionResponseStatus {
  Success,
  Error,
}
export interface CallLLMChatCompletionResponseSuccess {
  status: CallLLMChatCompletionResponseStatus.Success;
  content: string;
  functionCall?: {
    name: string;
    arguments: { [key: string]: any };
  };
}

export interface CallLLMChatCompletionResponseError {
  status: CallLLMChatCompletionResponseStatus.Error;
  message: string;
}

export type CallLLMChatCompletionResponse =
  | CallLLMChatCompletionResponseSuccess
  | CallLLMChatCompletionResponseError;

export async function callLLMChatCompletion({
  messages,
  functions,
  model,
  temperature,
  maxTokens,
}: CallLLMChatCompletionArgs): Promise<CallLLMChatCompletionResponse> {
  const reqBody = {
    model,
    messages,
    functions,
    function_call: functions ? "auto" : undefined,
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
    return {
      status: CallLLMChatCompletionResponseStatus.Error,
      message: `Error calling API with status code ${response.status} and message "${errorText}"`,
    };
  }

  const resBody = await response.json();

  return {
    status: CallLLMChatCompletionResponseStatus.Success,
    content: resBody.choices[0].message.content as string,
    functionCall: resBody.choices[0].message.function_call
      ? {
          name: resBody.choices[0].message.function_call.name,
          arguments: JSON.parse(
            resBody.choices[0].message.function_call.arguments as string
          ),
        }
      : undefined,
  };
}

export interface CallAIFunctionArgs {
  function: string;
  args: any[];
  description: string;
  model: LLMModel;
}

export async function callAIFunction({
  function: aiFunction,
  args,
  description,
  model,
}: CallAIFunctionArgs): Promise<string> {
  args = args.map((arg) =>
    arg !== null && arg !== undefined ? `${String(arg)}` : "None"
  );
  const argsString = args.join(", ");

  const messages: LLMMessage[] = [
    {
      role: "system",
      content: `You are now the following typescript function: \`\`\`# ${description}\n${aiFunction}\`\`\`\n\nOnly respond with your \`return\` value.`,
    },
    { role: "user", content: argsString },
  ];

  const response = await callLLMChatCompletion({
    messages,
    model,
    temperature: 0.7,
  });

  return response.status === CallLLMChatCompletionResponseStatus.Success
    ? response.content
    : "";
}
