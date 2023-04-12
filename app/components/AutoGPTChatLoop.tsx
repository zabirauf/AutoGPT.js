import { useState, useEffect, Fragment, useMemo, useRef } from "react";
import { useAIState } from "./AIStateProvider";
import { LLMMessage } from "AutoGPT/utils/llmUtils";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/20/solid";
import { chatWithAI } from "AutoGPT/utils/chat";
import { generatePrompt } from "AutoGPT/utils/prompt";
import { permanentMemory } from "AutoGPT/commandPlugins/MemoryCommandPlugins";
import { executeCommand, getCommand } from "AutoGPT/commandPlugins/index";
import { PauseButton, ResumeButton } from "./Buttons";
import { useCallback } from "react";

const USER_INPUT =
  "Determine which next command to use, and respond using the format specified above:";

export function AutoGPTChatLoop() {
  const {
    aiInfo: { name, description, goals },
  } = useAIState();

  const fullMessageHistory = useRef<LLMMessage[]>([]);
  const userInput = useRef<string>(USER_INPUT);
  const isChatInProgress = useRef<boolean>(false);
  const prevMessageIndexRan = useRef<number>(-1); // Should be different from currMessageIndex

  const [currMessageIndex, setCurrMessageIndex] = useState<number>(0);
  const [activities, setActivities] = useState<Activity[]>([]);
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
    if (isChatInProgress.current || prevMessageIndexRan.current === currMessageIndex || isPaused) {
      // Already chat in progress or some other state changed, where we shouldn't run
      return;
    }
    const appendToFullMessageHistory = (messages: LLMMessage[]) => {
      fullMessageHistory.current.push(...messages);
      setActivities(
        fullMessageHistory.current.map((msg, index) =>
          convertMessageToActivity(index, msg)
        )
      );
    };

    isChatInProgress.current = true;
    prevMessageIndexRan.current = currMessageIndex;
    chatWithAI({
      prompt: generatePrompt(name, description, goals),
      fullMessageHistory: fullMessageHistory.current,
      appendToFullMessageHistory,
      permanentMemory,
      tokenLimit: 4000,
      userInput: userInput.current,
      debug: true,
    })
      .then(async (assistantReply) => {
        let commandName: string = "error";
        let args: string | { [key: string]: string } = {};
        try {
          [commandName, args] = await getCommand(assistantReply);
        } catch (error) {
          console.error("Error when getting command", error);
        }

        userInput.current = "GENERATE NEXT COMMAND JSON";

        let result: string;
        if (commandName.toLowerCase() != "error" && typeof args !== "string") {
          const executedCommandResponse = await executeCommand(
            commandName,
            args
          );
          result = `Command ${commandName} returned: ${executedCommandResponse}`;
        } else {
          result = `Command ${commandName} threw the following error: ${args}`;
        }
        appendToFullMessageHistory([{ role: "system", content: result }]);
        setCurrMessageIndex(currMessageIndex + 1);
      })
      .finally(() => {
        isChatInProgress.current = false;
      });
  }, [currMessageIndex, isPaused]);

  return (
    <>
      <ActivityFeed activities={activities} />
      <div className="w-full flex justify-center align-middle mt-8">
        {!isPaused && <PauseButton onClick={togglePause} />}
        {isPaused && <ResumeButton onClick={togglePause} />}
      </div>
    </>
  );
}

function convertMessageToActivity(
  id: number,
  message: LLMMessage
): ChatActivity {
  return {
    id,
    type: `chat:${message.role}`,
    content: message.content,
  };
}

type ActivityChatType = `chat:${LLMMessage["role"]}`;

interface ChatActivity {
  id: number;
  type: ActivityChatType;
  content: string;
}

interface AppActivity {
  id: number;
  type: "app:ask_user";
}

type Activity = AppActivity | ChatActivity;

interface ChatActivityProps {
  activity: ChatActivity;
}
function ChatActivity({ activity }: ChatActivityProps) {
  return (
    <>
      <div>
        <div className="relative px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
            <ChatBubbleLeftEllipsisIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div>
          <div className="text-sm">
            {activity.type === "chat:system"
              ? "🖥️"
              : activity.type === "chat:user"
              ? "🦸🏽"
              : "🤖"}
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-700">
          <p>{activity.content}</p>
        </div>
      </div>
    </>
  );
}

interface ActivityFeedProps {
  activities: Activity[];
}
function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {activities.map((activityItem, activityItemIdx) => (
          <li key={activityItem.id}>
            <div className="relative pb-8">
              {activityItemIdx !== activities.length - 1 ? (
                <span
                  className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                {activityItem.type !== "app:ask_user" ? (
                  <ChatActivity activity={activityItem} />
                ) : (
                  "Ask user"
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
