import AgentCommandPlugins from './AgentCommandPlugins';
import BrowserCommandPlugins from './BrowserCommandPlugins';
import CodeGenerationCommandPlugin from './CodeGenerationCommandPlugin';
import FileOperationCommandPlugins from './FileOperationCommandPlugins';
import MemoryCommandPlugins from './MemoryCommandPlugins';
import TaskCompleteCommandPlugins from './TaskCompleteCommandPlugins';
import { fixAndParseJson } from '../utils/jsonParsingAssist';

export const CommandPlugins = [
  ...MemoryCommandPlugins,
  ...AgentCommandPlugins,
  ...FileOperationCommandPlugins,
  ...TaskCompleteCommandPlugins,
  ...CodeGenerationCommandPlugin,
  ...BrowserCommandPlugins
];

export async function getCommand(
  response: string
): Promise<{
  commandName: string;
  argumentsObj: string | { [key: string]: string };
  jsonResponse?: any;
}> {
  try {
    const responseJson = (await fixAndParseJson(response)) as any;

    if (!responseJson["command"]) {
      return {
        commandName: "Error:",
        argumentsObj: "Missing 'command' object in JSON",
      };
    }

    const command = responseJson["command"] as any;

    if (!command["name"]) {
      return {
        commandName: "Error:",
        argumentsObj: "Missing 'name' field in 'command' object",
      };
    }

    const commandName = command["name"] as string;
    const argumentsObj: { [key: string]: string } = command["args"] || {};

    return { commandName, argumentsObj, jsonResponse: responseJson };
  } catch (e) {
    if (e instanceof SyntaxError) {
      return { commandName: "Error:", argumentsObj: "Invalid JSON" };
    }
    return { commandName: "Error:", argumentsObj: String(e) };
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
