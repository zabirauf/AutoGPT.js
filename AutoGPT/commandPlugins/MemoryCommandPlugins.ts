import { CommandPlugin } from "./CommandPlugin";

export const permanentMemory: string[] = [];

function commitMemory(val: string) {
  permanentMemory.push(val);

  return `Committing memory with string "${val}"`;
}
function getMemory(index: number) {
  if (index >= permanentMemory.length) {
    return "Invalid key, cannot retrieve memory.";
  }
  return permanentMemory[index];
}

function deleteMemory(index: number) {
  if (index >= permanentMemory.length) {
    return "Invalid key, cannot delete memory.";
  }

  permanentMemory.splice(index, 1);
  return `Deleting memory with key ${index}.`;
}

function overwriteMemory(index: number, val: string) {
  if (index >= permanentMemory.length) {
    return "Invalid key, cannote overwrite memory.";
  }

  permanentMemory[index] = val;
  return `Overwriting memory with key ${index} and string "${val}".`;
}

const MemoryCommandPlugins: CommandPlugin[] = [
  {
    command: "memory_add",
    name: "Memory Add",
    arguments: {
      string: "string",
    },
    execute: async (args) => commitMemory(args["string"]),
  },
  {
    command: "memory_del",
    name: "Memory Delete",
    arguments: {
        key: "key"
    },
    execute: async (args) => deleteMemory(parseInt(args["key"]))
  },
  {
    command: "memory_ovr",
    name: "Memory Overwrite",
    arguments: {
        key: "key",
        string: "string"
    },
    execute: async (args) => overwriteMemory(parseInt(args["key"]), args["string"])
  },
];
export default MemoryCommandPlugins;
