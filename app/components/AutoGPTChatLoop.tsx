import {
  useState,
  useEffect,
  Fragment,
  useMemo,
  useRef,
  PropsWithChildren,
} from "react";
import { useAIState } from "./AIStateProvider";
import { LLMMessage } from "AutoGPT/utils/llmUtils";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/20/solid";
import { chatWithAI } from "AutoGPT/utils/chat";
import { generatePrompt } from "AutoGPT/utils/prompt";
import { permanentMemory } from "AutoGPT/commandPlugins/MemoryCommandPlugins";
import { executeCommand, getCommand } from "AutoGPT/commandPlugins/index";
import { PauseButton, ResumeButton } from "./Buttons";
import { useCallback } from "react";
import {
  AIResponseSchema,
  fixAndParseJson,
} from "AutoGPT/utils/jsonParsingAssist";
import { assertNever } from "~/utils/asserts";

const USER_INPUT =
  "Determine which next command to use, and respond using the format specified above:";

export function AutoGPTChatLoop() {
  const [activities, setActivities] = useState<Activity[]>([]);

  const { isPaused, togglePause } = useAutoGPTChat((activity) =>
    setActivities((prevState) => [...prevState, activity])
  );

  return (
    <>
      <ActivityFeed activities={activities} />
      <div className="mt-8 flex w-full justify-center align-middle">
        {!isPaused && <PauseButton onClick={togglePause} />}
        {isPaused && <ResumeButton onClick={togglePause} />}
      </div>
    </>
  );
}

function useAutoGPTChat(onActivity: (activity: Activity) => void) {
  const {
    aiInfo: { name, description, goals },
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
          fixAndParseJson(assistantReply).then((val) => {
            const aiResponse = val as AIResponseSchema;
            if (aiResponse["thoughts"]) {
              onActivity({
                type: "chat:command",
                response: aiResponse,
                id: generateID(),
              });
            }
          });
          const executedCommandResponse = await executeCommand(
            commandName,
            args
          );

          onActivity({
            type: "chat:command:executed",
            executionResponse: executedCommandResponse,
            id: generateID(),
          });
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

  return { isPaused, togglePause };
}

interface ChatCommandActivity {
  id: string;
  type: "chat:command";
  response: AIResponseSchema;
}
interface ChatCommandExecutedActivity {
  id: string;
  type: "chat:command:executed";
  executionResponse: string;
}
interface AppAskUserActivity {
  id: string;
  type: "app:ask_user";
}
type Activity =
  | ChatCommandActivity
  | ChatCommandExecutedActivity
  | AppAskUserActivity;

interface ActivityBaseProps extends PropsWithChildren {
  activityText: string;
}
function ActivityBase(props: ActivityBaseProps) {
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
          <div className="text-sm">{props.activityText}</div>
        </div>
        <div className="mt-2 text-sm text-gray-700">{props.children}</div>
      </div>
    </>
  );
}

interface InfoRowProps extends PropsWithChildren {
  fieldName: string;
}

function InfoRow(props: InfoRowProps) {
  return (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
      <dt className="text-sm font-medium text-gray-500">{props.fieldName}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
        {props.children}
      </dd>
    </div>
  );
}

interface ChatCommandActivityProps {
  activity: ChatCommandActivity;
}
function ChatCommandActivity({ activity }: ChatCommandActivityProps) {
  return (
    <ActivityBase activityText="🤖">
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          {activity.response.command?.name && (
            <InfoRow fieldName="Command">
              <div>Command: <b>{activity.response.command.name}</b></div>
              <div>Args: {JSON.stringify(activity.response.command.args)}</div>
            </InfoRow>
          )}
          {activity.response.thoughts?.text && (
            <InfoRow fieldName="Thoughts">
              {activity.response.thoughts.text}
            </InfoRow>
          )}
          {activity.response.thoughts?.reasoning && (
            <InfoRow fieldName="Reasoning">
              {activity.response.thoughts.reasoning}
            </InfoRow>
          )}
          {activity.response.thoughts?.criticism && (
            <InfoRow fieldName="Criticism">
              {activity.response.thoughts.criticism}
            </InfoRow>
          )}
          {activity.response.thoughts?.plan && (
            <InfoRow fieldName="Plan">
              <ul className="list-decimal">
                {activity.response.thoughts.plan
                  .split("\n")
                  .map((s) => s.replaceAll("- ", ""))
                  .map((s) => (
                    <li>{s}</li>
                  ))}
              </ul>
            </InfoRow>
          )}
        </dl>
      </div>
    </ActivityBase>
  );
}
interface ChatCommandActivityExecutedProps {
  activity: ChatCommandExecutedActivity;
}
function ChatCommandExecutedActivity({
  activity,
}: ChatCommandActivityExecutedProps) {
  return (
    <ActivityBase activityText="🖥️">
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <InfoRow fieldName="Execution response">
            {activity.executionResponse.split("\n").map((s) => (
              <p>{s}</p>
            ))}
          </InfoRow>
        </dl>
      </div>
    </ActivityBase>
  );
}

function Activity({ activity }: { activity: Activity }) {
  if (activity.type === "chat:command") {
    return <ChatCommandActivity activity={activity} />;
  } else if (activity.type === "chat:command:executed") {
    return <ChatCommandExecutedActivity activity={activity} />;
  } else if (activity.type === "app:ask_user") {
    return <>{"Ask user"}</>;
  } else {
    return assertNever(activity);
  }
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
                <Activity key={activityItem.id} activity={activityItem} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const generateID = (): string => Math.random().toString(36).slice(2, 11);
