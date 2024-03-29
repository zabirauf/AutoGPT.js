import { addThoughtArgsToSchema, getFunctionSchema } from 'AutoGPT/utils/functionsSchema';
import { CallLLMChatCompletionResponseStatus } from 'AutoGPT/utils/llmUtils';
import { chatWithAI } from 'AutoGPT/utils/chat';
import { executeCommand } from 'AutoGPT/commandPlugins/index';
import { generatePrompt } from 'AutoGPT/utils/promptV2';
import { permanentMemory } from 'AutoGPT/commandPlugins/MemoryCommandPlugins';
import {
  useCallback,
  useEffect,
  useRef,
  useState
  } from 'react';
import type { AIResponseSchema, LLMMessage, LLMModel } from "AutoGPT/utils/types";
import { useAIState } from "~/components/AIStateProvider";
import { generateID } from "~/utils/generateID";
import type { Activity } from "~/types/Activity";

const USER_INPUT =
  "Determine which function to call.";

export function useAutoGPTChat(
  onActivity: (activity: Activity) => void,
  onTaskCompleted: () => void
) {
  const {
    aiInfo: { name, description, goals, model },
  } = useAIState();

  const fullMessageHistory = useRef<LLMMessage[]>([]);
  const userInput = useRef<string>(USER_INPUT);
  const isChatInProgress = useRef<boolean>(false);
  const prevMessageIndexRan = useRef<number>(-1); // Should be different from currMessageIndex

  const [currMessageIndex, setCurrMessageIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const togglePause = useCallback(() => {
    // Toggle paused
    setIsPaused(!isPaused);

    if (!isPaused) {
      // If we need to run again, increase message index so chat gets triggered again
      setCurrMessageIndex(currMessageIndex + 1);
    }
  }, [isPaused, currMessageIndex]);

  useEffect(() => {
    if (
      isChatInProgress.current ||
      prevMessageIndexRan.current === currMessageIndex ||
      isPaused
    ) {
      // Already chat in progress or some other state changed, where we shouldn't run
      return;
    }
    const appendToFullMessageHistory = (messages: LLMMessage[]) =>
      fullMessageHistory.current.push(...messages);

    isChatInProgress.current = true;
    prevMessageIndexRan.current = currMessageIndex;
    onActivity({
      type: "system:info",
      prompt: "Generating next command",
      id: generateID(),
    });
    chatWithAI({
      prompt: generatePrompt(name, description, goals),
      fullMessageHistory: fullMessageHistory.current,
      appendToFullMessageHistory,
      permanentMemory,
      tokenLimit: 4000,
      model: model as LLMModel,
      functions: addThoughtArgsToSchema(getFunctionSchema()),
      userInput: userInput.current,
      debug: true,
    })
      .then(async (assistantReply) => {
        let commandName: string = "error";
        let args: string | { [key: string]: string } = {};
        let rawParsedResponse: AIResponseSchema | undefined = undefined;

        try {
          if (assistantReply.status === CallLLMChatCompletionResponseStatus.Success) {
            commandName = assistantReply.functionCall?.name ?? "error";
            args = assistantReply.functionCall?.arguments ?? {};
            rawParsedResponse = {
              command: {
                name: assistantReply.functionCall?.name!,
                args: assistantReply.functionCall?.arguments || {}
              },
              thoughts: {
                reasoning: assistantReply.functionCall?.arguments["_reasoning"],
                criticism: assistantReply.functionCall?.arguments["_criticism"],
                plan: assistantReply.functionCall?.arguments["_plan"],
                text: assistantReply.functionCall?.arguments["_thought"]
              }
            };
          }
        } catch (error) {
          console.error("Error when getting command", error);
        }

        userInput.current = `GENERATE NEXT FUNCTION`;

        let result: string;
        if (commandName.toLowerCase() != "error" && typeof args !== "string") {
          if (rawParsedResponse) {
            if (
              rawParsedResponse["command"] &&
              rawParsedResponse["command"]["name"] == "write_to_file" &&
              !!rawParsedResponse["command"]["args"]["file"] &&
              /\.(js|py)$/.test(rawParsedResponse["command"]["args"]["file"])
            ) {
              // When its code being written to a file
              onActivity({
                type: "chat:command:code",
                response: rawParsedResponse,
                code: rawParsedResponse["command"]["args"]["text"],
                id: generateID(),
              });
            } else if (
              rawParsedResponse["command"] &&
              (rawParsedResponse["command"]["name"] === "evaluate_code" ||
                rawParsedResponse["command"]["name"] === "improve_code" ||
                rawParsedResponse["command"]["name"] === "write_tests") &&
              !!rawParsedResponse["command"]["args"]["code"]
            ) {
              // When its code related command
              onActivity({
                type: "chat:command:code",
                response: rawParsedResponse,
                code: rawParsedResponse["command"]["args"]["code"],
                id: generateID(),
              });
            } else if (rawParsedResponse["thoughts"]) {
              onActivity({
                type: "chat:command",
                response: rawParsedResponse,
                id: generateID(),
              });
            }
          }

          // Execution of command
          const executedCommandResponse = await executeCommand(
            commandName,
            args
          );

          // TODO: There can be a race condition where the following activity is added before the command activity
          onActivity({
            type: "chat:command:executed",
            executionResponse: executedCommandResponse,
            id: generateID(),
          });
          result = `Command ${commandName} returned: ${executedCommandResponse}`;
        } else {
          result = `Command ${commandName} threw the following error: ${args}`;
          onActivity({
            type: "chat:command:error",
            error: result,
            id: generateID(),
          });
        }
        appendToFullMessageHistory([{ role: "user", content: result }]);

        if (commandName === "task_complete") {
          onTaskCompleted();
        } else {
          setCurrMessageIndex(currMessageIndex + 1);
        }
      })
      .finally(() => {
        isChatInProgress.current = false;
      });
  }, [currMessageIndex, isPaused]);

  return { isPaused, togglePause };
}
