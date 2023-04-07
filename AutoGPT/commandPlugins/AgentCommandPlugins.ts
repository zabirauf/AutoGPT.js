import { LLMMessage, LLMModel, callLLMChatCompletion } from "AutoGPT/utils/llmUtils";
import { Config } from "AutoGPT/utils/config";
import { CommandPlugin } from "./CommandPlugin";

interface Agent {
  name: string;
  task: string;
  messages: LLMMessage[];
  model: LLMModel;
}

let nextkey = 0;
const agents: {[key: string]: Agent} = {};

async function startAgent(
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

async function createAgent(
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

async function messageAgent(
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

function listAgents(): [string, string][] {
  return Object.keys(agents).map((key: string) => [key, agents[key].task]);
}

function deleteAgent(key: string): boolean {
  if (agents[key]) {
    delete agents[key];
    return true;
  }

  return false;
}

const AgentCommandPlugins: CommandPlugin[] = [
  {
    command: "start_agent",
    name: "Start GPT Agent",
    arguments: {
      name: "name",
      task: "short_task_desc",
      prompt: "prompt"
    },
    execute: (args) => startAgent(args["name"], args["task"], args["prompt"])
  },
  {
    command: "message_agent",
    name: "Message GPT Agent",
    arguments: {
      key: "key",
      message: "message"
    },
    execute: (args) => messageAgent(args["key"], args["message"])
  },
  {
    command: "list_agents",
    name: "List GPT Agents",
    arguments: {},
    execute: async (args) => JSON.stringify(listAgents())
  },
  {
    command: "delete_agent",
    name: "Delete GPT Agent",
    arguments: {
      key: "key"
    },
    execute: async (args) => deleteAgent(args["key"])
        ? `Agent ${args["key"]} deleted.`
        : `Agent ${args["key"]} does not exist.`
  }
];
export default AgentCommandPlugins;