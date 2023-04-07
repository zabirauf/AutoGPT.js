import { CommandPlugin } from "./CommandPlugin";

export let taskComplete = false;

const TaskCompleteCommandPlugins: CommandPlugin[] = [
  {
    command: "task_complete",
    name: "Task Complete (Shutdown)",
    arguments: {
      reason: "reason",
    },
    execute: async (args) => {
      taskComplete = true;
      console.debug("Task complete", args["reason"]);
      return "Thank you";
    },
  },
];
export default TaskCompleteCommandPlugins;
