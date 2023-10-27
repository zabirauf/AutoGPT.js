export type CommandExecArgs = { [key: string]: any };

type StringExecArg = { type: "string" };
type IntExecArg = { type: "integer" };
type BoolExecArg = { type: "boolean" };
type ArrayExecArg = { type: "array"; items: ExecArgType };
type EnumExecArg = { type: "string"; enum: string[] };

type ExecArgType = StringExecArg | IntExecArg | ArrayExecArg | EnumExecArg | BoolExecArg;

export type CommandExecArgsV2 = {
  [key: string]: {
    description: string;
  } & ExecArgType;
};

export interface CommandPlugin {
  command: string;
  name: string;
  arguments: CommandExecArgs;
  argumentsV2: { required: string[]; args: CommandExecArgsV2 };
  execute: (args: CommandExecArgs) => Promise<string>;
}
