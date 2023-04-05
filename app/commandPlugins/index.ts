import AgentCommandPlugins from "./AgentCommandPlugins";
import MemoryCommandPlugins from "./MemoryCommandPlugins";
import FileOperationCommandPlugins from "./FileOperationCommandPlugins";
import TaskCompleteCommandPlugins from "./TaskCompleteCommandPlugins";

export const CommandPlugins = [
  ...MemoryCommandPlugins,
  ...AgentCommandPlugins,
  ...FileOperationCommandPlugins,
  ...TaskCompleteCommandPlugins
];

export async function executeCommand(
  command: string,
  args: { [key: string]: string }
): Promise<string> {
  try {
    const commandPlugin = CommandPlugins.filter(({command: cmd}) => cmd == command)[0];
    if (commandPlugin) {
      return await commandPlugin.execute(args);
    } else {
        return `Unknown command ${command}`;
    }
  } catch (error) {
    return `Error: ${error}`;
  }
}