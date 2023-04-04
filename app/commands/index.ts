import { startAgent, deleteAgent, messageAgent, listAgents } from "./agents";
import {
  overwriteMemory,
  deleteMemory,
  commitMemory,
} from "./memory";
import { Config } from "~/utils/config";

export async function executeCommand(
  command: string,
  args: { [key: string]: string }
): Promise<string> {
  try {
    if (command === "memory_add") {
      return commitMemory(args["string"]);
    } else if (command === "memory_del") {
      return deleteMemory(parseInt(args["key"]));
    } else if (command === "memory_ovr") {
      return overwriteMemory(parseInt(args["key"]), args["string"]);
    } else if (command === "start_agent") {
      return await startAgent(args["name"], args["task"], args["prompt"]);
    } else if (command === "message_agent") {
      return await messageAgent(args["key"], args["message"]);
    } else if (command === "list_agents") {
      return JSON.stringify(listAgents());
    } else if (command === "delete_agent") {
      return deleteAgent(args["key"])
        ? `Agent ${args["key"]} deleted.`
        : `Agent ${args["key"]} does not exist.`;
    } else {
        return `Unknown command ${command}`;
    }
  } catch (error) {
    return `Error: ${error}`;
  }
}
