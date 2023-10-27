import { getConfig } from 'AutoGPT/utils/config';
import type { CommandPlugin } from './CommandPlugin';
import {
  callLLMChatCompletion,
  CallLLMChatCompletionResponseStatus,
} from "AutoGPT/utils/llmUtils";
import type { LLMMessage, LLMModel } from "AutoGPT/utils/types";

interface Agent {
  name: string;
  task: string;
  messages: LLMMessage[];
  model: LLMModel;
}

let nextkey = 0;
const agents: { [key: string]: Agent } = {};

async function startAgent(
  name: string,
  task: string,
  prompt: string,
  context: string,
  model: LLMModel
) {
  const firstMessage = `You are ${name}. Respond with: "Acknowledged".`;
  const { key } = await createAgent(
    name,
    task,
    firstMessage,
    model
  );

  const agentResponse = await messageAgent(key, prompt, context);

  return `Agent ${name} created with key ${key}. First response: ${agentResponse}`;
}

async function createAgent(
  name: string,
  task: string,
  prompt: string,
  model: LLMModel
): Promise<{ key: string; agentReply: string }> {
  const messages: LLMMessage[] = [{ role: "user", content: prompt }];

  const agentReply = await callLLMChatCompletion({ messages, model });

  messages.push({
    role: "assistant",
    content:
      agentReply.status === CallLLMChatCompletionResponseStatus.Success
        ? agentReply.content
        : "error",
  });

  const agent: Agent = {
    name,
    task,
    messages,
    model,
  };
  const key = `${nextkey}`;
  nextkey = nextkey + 1;

  agents[key] = agent;

  return {
    key,
    agentReply:
      agentReply.status === CallLLMChatCompletionResponseStatus.Success
        ? agentReply.content
        : "error",
  };
}

async function messageAgent(
  key: string,
  message: string,
  data: string
): Promise<string> {
  if (!agents[key]) {
    return "Invalid key, agent doesn't exist";
  }
  const { messages, model } = agents[key];
  messages.push({
    role: "user",
    content: `|Start of data|\n${data}\n|End of data|\n\n${message}`,
  });

  const agentReply = await callLLMChatCompletion({ messages, model });

  messages.push({ role: "assistant", content: agentReply.status === CallLLMChatCompletionResponseStatus.Success ? agentReply.content : "error" });
  return agentReply.status === CallLLMChatCompletionResponseStatus.Success ? agentReply.content : "error";
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
      prompt: "prompt",
      data: "data_for_prompt",
    },
    argumentsV2: {
      required: ["name", "task", "prompt", "data"],
      args: {
        name: { type: "string", description: "Name of the agent" },
        task: {
          type: "string",
          description:
            "Short description of what is the task that agent is going to perform",
        },
        prompt: { type: "string", description: "The prompt for the agent" },
        data: {
          type: "string",
          description: "Data or context that agent should use",
        },
      },
    },
    execute: (args) =>
      startAgent(
        args["name"],
        args["task"],
        args["prompt"],
        args["data"],
        getConfig().models.plugins.agentModel
      ),
  },
  {
    command: "message_agent",
    name: "Message GPT Agent",
    arguments: {
      key: "key",
      message: "message",
      data: "data_for_message",
    },
    argumentsV2: {
      required: ["key", "message", "data"],
      args: {
        key: { type: "integer", description: "The key of the agent to delete" },
        message: { type: "string", description: "The message for the agent" },
        data: {
          type: "string",
          description: "Data or context that agent should use",
        },
      },
    },
    execute: (args) => messageAgent(args["key"], args["message"], args["data"]),
  },
  {
    command: "list_agents",
    name: "List GPT Agents",
    arguments: {},
    argumentsV2: {
      required: [],
      args: {},
    },
    execute: async (args) => JSON.stringify(listAgents()),
  },
  {
    command: "delete_agent",
    name: "Delete GPT Agent",
    arguments: {
      key: "key",
    },
    argumentsV2: {
      required: ["key"],
      args: {
        key: { type: "integer", description: "The key of the agent to delete" },
      },
    },
    execute: async (args) =>
      deleteAgent(args["key"])
        ? `Agent ${args["key"]} deleted.`
        : `Agent ${args["key"]} does not exist.`,
  },
];
export default AgentCommandPlugins;
