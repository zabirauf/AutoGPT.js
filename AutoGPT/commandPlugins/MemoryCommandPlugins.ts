import type { CommandPlugin } from './CommandPlugin';

export const permanentMemory: string[] = [];

function commitMemory(val: string) {
  permanentMemory.push(val);

  return `Committing memory with key ${
    permanentMemory.length - 1
  } and string "${val}"`;
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
    return "Invalid key, cannot overwrite memory.";
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
    argumentsV2: {
      required: ["string"],
      args: {
        string: { type: "string", description: "The content to add to memory" },
      },
    },
    execute: async (args) => commitMemory(args["string"]),
  },
  {
    command: "memory_del",
    name: "Memory Delete",
    arguments: {
      key: "key",
    },
    argumentsV2: {
      required: ["key"],
      args: {
        key: {
          type: "integer",
          description: "The key of the previously added memory to delete",
        },
      },
    },
    execute: async (args) => deleteMemory(parseInt(args["key"])),
  },
  {
    command: "memory_ovr",
    name: "Memory Overwrite",
    arguments: {
      key: "key",
      string: "string",
    },
    argumentsV2: {
      required: ["key", "string"],
      args: {
        key: {
          type: "integer",
          description: "The key of the memory to override",
        },
        string: { type: "string", description: "The content to add to memory" },
      },
    },
    execute: async (args) =>
      overwriteMemory(parseInt(args["key"]), args["string"]),
  },
];
export default MemoryCommandPlugins;
