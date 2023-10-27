import type { CommandPlugin } from './CommandPlugin';

export let taskComplete = false;

const TaskCompleteCommandPlugins: CommandPlugin[] = [
  {
    command: "task_complete",
    name: "Task Complete (Shutdown)",
    arguments: {
      reason: "reason",
    },
    argumentsV2: {
      required: ["reason"],
      args: {
        reason: { type: "string", description: "Reason of why the task is considered to be completed either due to goal completing or unable to complete"}
      }
    },
    execute: async (args) => {
      taskComplete = true;
      console.debug("Task complete", args["reason"]);
      return "Thank you";
    },
  },
];
export default TaskCompleteCommandPlugins;
