import { LLMMessage, LLMModel, callLLMChatCompletion } from "~/utils/llmUtils";
import { Config } from "~/utils/config";

export interface Agent {
  name: string;
  task: string;
  messages: LLMMessage[];
  model: LLMModel;
}

let nextkey = 0;
const agents: {[key: string]: Agent} = {};

export async function startAgent(
  name: string,
  task: string,
  prompt: string,
  model: LLMModel = Config.fast_llm_model
) {
    const firstMessage = `You are ${name}. Respond with: "Acknowledged".`;
    const { key, agentReply } = await createAgent(name, task, firstMessage, model);

    const agentResponse = await messageAgent(key, prompt);

    return `Agent ${name} created with key ${key}. First response: ${agentResponse}`;
}

export async function createAgent(
  name: string,
  task: string,
  prompt: string,
  model: LLMModel
): Promise<{ key: string; agentReply: string }> {
  const messages: LLMMessage[] = [{ role: "user", content: prompt }];

  const agentReply = await callLLMChatCompletion(messages, model);

  messages.push({ role: "assistant", content: agentReply });

  const agent: Agent = {
    name,
    task,
    messages,
    model,
  };
  const key = `${nextkey}`;
  nextkey = nextkey + 1;

  agents[key] = agent;

  return { key, agentReply };
}

export async function messageAgent(
  key: string,
  message: string
): Promise<string> {
  if (!agents[key]) {
    return "Invalid key, agent doesn't exist";
  }
  const { messages, model } = agents[key];
  messages.push({ role: "user", content: message });

  const agentReply = await callLLMChatCompletion(messages, model);

  messages.push({ role: "assistant", content: agentReply });
  return agentReply;
}

export function listAgents(): [string, string][] {
  return Object.keys(agents).map((key: string) => [key, agents[key].task]);
}

export function deleteAgent(key: string): boolean {
  if (agents[key]) {
    delete agents[key];
    return true;
  }

  return false;
}
