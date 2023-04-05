
export type CommandExecArgs = { [key: string]: string };
export interface CommandPlugin {
    command: string;
    name: string;
    arguments: CommandExecArgs;
    execute: (args: CommandExecArgs) => Promise<string>;
}