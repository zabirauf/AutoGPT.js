
export type CommandExecArgs = { [key: string]: any };
export interface CommandPlugin {
    command: string;
    name: string;
    arguments: CommandExecArgs;
    execute: (args: CommandExecArgs) => Promise<string>;
}