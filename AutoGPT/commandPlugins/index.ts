import AgentCommandPlugins from './AgentCommandPlugins';
import BrowserCommandPlugins from './BrowserCommandPlugins';
import CodeGenerationCommandPlugin from './CodeGenerationCommandPlugin';
import FileOperationCommandPlugins from './FileOperationCommandPlugins';
import MemoryCommandPlugins from './MemoryCommandPlugins';
import TaskCompleteCommandPlugins from './TaskCompleteCommandPlugins';
import { fixAndParseJson } from 'AutoGPT/utils/jsonParsingAssist';
import { fixAndParseYAML } from 'AutoGPT/utils/yamlParsingAssist';
import type { ResponseSchema } from "AutoGPT/utils/types";

export const CommandPlugins = [
  ...MemoryCommandPlugins,
  ...BrowserCommandPlugins,
  ...FileOperationCommandPlugins,
  ...AgentCommandPlugins,
  ...CodeGenerationCommandPlugin,
  ...TaskCompleteCommandPlugins,
];

export async function getCommand(
  response: string,
  responseSchema: ResponseSchema
): Promise<{
  commandName: string;
  argumentsObj: string | { [key: string]: string };
  rawParsedResponse?: any;
}> {
  try {
    const rawParsedResponse =
      responseSchema === "JSON"
        ? ((await fixAndParseJson(response)) as any)
        : ((await fixAndParseYAML(response)) as any);

    if (!rawParsedResponse["command"]) {
      return {
        commandName: "Error:",
        argumentsObj: `Missing 'command' object in ${responseSchema}`,
      };
    }

    const command = rawParsedResponse["command"] as any;

    if (!command["name"]) {
      return {
        commandName: "Error:",
        argumentsObj: "Missing 'name' field in 'command' object",
      };
    }

    const commandName = command["name"] as string;
    const argumentsObj: { [key: string]: string } = command["args"] || {};

    return { commandName, argumentsObj, rawParsedResponse: rawParsedResponse };
  } catch (e) {
    if (e instanceof SyntaxError) {
      return {
        commandName: "Error:",
        argumentsObj: `Invalid ${responseSchema}`,
      };
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
