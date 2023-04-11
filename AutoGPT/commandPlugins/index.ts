import AgentCommandPlugins from "./AgentCommandPlugins";
import MemoryCommandPlugins from "./MemoryCommandPlugins";
import FileOperationCommandPlugins from "./FileOperationCommandPlugins";
import TaskCompleteCommandPlugins from "./TaskCompleteCommandPlugins";
import { fixAndParseJson } from "../utils/jsonParsingAssist";

export const CommandPlugins = [
  ...MemoryCommandPlugins,
  ...AgentCommandPlugins,
  ...FileOperationCommandPlugins,
  ...TaskCompleteCommandPlugins,
];

export async function getCommand(
  response: string
): Promise<[string, string | { [key: string]: string }]> {
  try {
    const responseJson = (await fixAndParseJson(response)) as any;

    if (!responseJson["command"]) {
      return ["Error:", "Missing 'command' object in JSON"];
    }

    const command = responseJson["command"] as any;

    if (!command["name"]) {
      return ["Error:", "Missing 'name' field in 'command' object"];
    }

    const commandName = command["name"] as string;
    const argumentsObj: { [key: string]: string } = command["args"] || {};

    return [commandName, argumentsObj];
  } catch (e) {
    if (e instanceof SyntaxError) {
      return ["Error:", "Invalid JSON"];
    }
    return ["Error:", String(e)];
  }
}

export async function executeCommand(
  command: string,
  args: { [key: string]: string }
): Promise<string> {
  try {
    const commandPlugin = CommandPlugins.filter(
      ({ command: cmd }) => cmd == command
    )[0];
    if (commandPlugin) {
      return await commandPlugin.execute(args);
    } else {
      return `Unknown command ${command}`;
    }
  } catch (error) {
    return `Error: ${error}`;
  }
}
