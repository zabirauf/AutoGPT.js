import hljs from 'highlight.js';
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/20/solid';
import { PauseButton, ResumeButton } from './Buttons';
import {
  PropsWithChildren,
  useEffect,
  useMemo,
  useState
  } from 'react';
import { Spinner } from './LoadingSpinner';
import { assertNever } from "~/utils/asserts";
import type {
  Activity,
  ChatCommandActivity,
  ChatCommandCodeActivity,
  ChatCommandErrorActivity,
  ChatCommandExecutedActivity,
  LoadingActivity,
  SystemInfoActivity,
} from "~/types/Activity";
import { useAutoGPTChat } from "~/hooks/useAutoGPTChat";
import { generateID } from "~/utils/generateID";

export function AutoGPTChatLoop() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isTaskCompleted, setIsTaskCompleted] = useState<boolean>(false);

  const { isPaused, togglePause } = useAutoGPTChat(
    (activity) => setActivities((prevState) => [...prevState, activity]),
    () => setIsTaskCompleted(true)
  );

  const activitiesWithLoading = useMemo(
    () => [
      ...activities,
      ...(isTaskCompleted ? [] : [{ ...DEFAULT_LOADING_ACTIVITY }]),
    ],
    [activities, isTaskCompleted]
  );

  return (
    <div>
      <ActivityFeed activities={activitiesWithLoading} />
      <div className="mt-8 flex w-full justify-center align-middle">
        {!isTaskCompleted && !isPaused && <PauseButton onClick={togglePause} />}
        {!isTaskCompleted && isPaused && <ResumeButton onClick={togglePause} />}
      </div>
    </div>
  );
}
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

interface ChatCommandCodeActivityProps {
  activity: ChatCommandCodeActivity;
}
function ChatCommandCodeActivityComponent({ activity }: ChatCommandCodeActivityProps) {
  useEffect(() => {
    hljs.highlightAll();
  });
  return (
    <ChatCommandActivityComponent activity={{ ...activity, type: "chat:command" }}>
      {activity.code && (
        <InfoRow fieldName="Code" key="code">
          <pre className="overflow-x-scroll">
            <code className="language-javascript">{activity.code}</code>
          </pre>
        </InfoRow>
      )}
    </ChatCommandActivityComponent>
  );
}

interface ChatCommandActivityProps extends PropsWithChildren {
  activity: ChatCommandActivity;
}
function ChatCommandActivityComponent({ activity, children }: ChatCommandActivityProps) {
  return (
    <ActivityBase activityText="🤖">
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          {activity.response.command?.name && (
            <InfoRow fieldName="Command" key="command">
              <div>
                Command: <b>{activity.response.command.name}</b>
              </div>
              <div>Args: {JSON.stringify(activity.response.command.args)}</div>
            </InfoRow>
          )}
          {activity.response.thoughts?.text && (
            <InfoRow fieldName="Thoughts" key="thoughts">
              {activity.response.thoughts.text}
            </InfoRow>
          )}
          {activity.response.thoughts?.reasoning && (
            <InfoRow fieldName="Reasoning" key="reasoning">
              {activity.response.thoughts.reasoning}
            </InfoRow>
          )}
          {activity.response.thoughts?.criticism && (
            <InfoRow fieldName="Criticism" key="criticism">
              {activity.response.thoughts.criticism}
            </InfoRow>
          )}
          {activity.response.thoughts?.plan && (
            <InfoRow fieldName="Plan" key="plan">
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
          {children}
        </dl>
      </div>
    </ActivityBase>
  );
}

interface ChatCommandActivityExecutedProps {
  activity: ChatCommandExecutedActivity;
}
function ChatCommandExecutedActivityComponent({
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

interface ChatCommandErrorActivityProps{
  activity: ChatCommandErrorActivity;
}
function ChatCommandErrorActivityComponent({
  activity,
}: ChatCommandErrorActivityProps) {
  return (
    <ActivityBase activityText="🤖">
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <InfoRow fieldName="Error">
              <p className='text-red-500'>{activity.error}</p>
          </InfoRow>
        </dl>
      </div>
    </ActivityBase>
  );
}



interface SystemInfoActivityProps {
  activity: SystemInfoActivity;
}
function SystemInfoActivityComponent({
  activity,
}: SystemInfoActivityProps) {
  return (
    <ActivityBase activityText="ℹ️">
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <InfoRow fieldName="Info">
              <p>{activity.prompt}</p>
          </InfoRow>
        </dl>
      </div>
    </ActivityBase>
  );
}



function LoadingActivityComponent() {
  return (
    <ActivityBase activityText="">
      <div className="w-96">
        <Spinner />
      </div>
    </ActivityBase>
  );
}

function ActivityComponent({ activity }: { activity: Activity }) {
  if (activity.type === "system:info") {
    return <SystemInfoActivityComponent activity={activity} />;
  } else if (activity.type === "chat:command") {
    return <ChatCommandActivityComponent activity={activity} />;
  } else if (activity.type === "chat:command:code") {
    return <ChatCommandCodeActivityComponent activity={activity} />;
  } else if (activity.type === "chat:command:executed") {
    return <ChatCommandExecutedActivityComponent activity={activity} />;
  } else if (activity.type === "chat:command:error") {
    return <ChatCommandErrorActivityComponent activity={activity} />;
  } else if (activity.type === "app:ask_user") {
    return <>{"Ask user"}</>;
  } else if (activity.type === "app:loading") {
    return <LoadingActivityComponent />;
  } else {
    return assertNever(activity);
  }
}

const DEFAULT_LOADING_ACTIVITY: LoadingActivity = {
  id: generateID(),
  type: "app:loading",
};

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
                <ActivityComponent key={activityItem.id} activity={activityItem} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
