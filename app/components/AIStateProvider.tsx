import { Config } from 'AutoGPT/utils/config';
import {
  createContext,
  useContext,
  useEffect,
  useReducer
  } from 'react';
import { getAPIKey } from 'AutoGPT/utils/apiKey';
import type { Dispatch, PropsWithChildren } from "react";
import { assertNever } from "~/utils/asserts";

/* Top level AI State */
interface AIState {
  setup: SetupReducerState;
  aiInfo: AIInfoState;
}

const AI_INFO_STATE_KEY = "AI_INFO_STATE";
function getDefaultAIState(): AIState {
  const DEFAULT_AI_STATE = Object.freeze<AIState>({
    setup: {
      stage: "not_init",
    },
    aiInfo: {
      name: "Entrepreneur-GPT",
      description:
        "an AI designed to autonomously develop and run businesses with the sole goal of increasing your net worth.",
      goals: [
        "Increase net worth",
        "Grow Twitter Account",
        "Develop and manage multiple businesses autonomously",
      ],
      model: Config.fast_llm_model,
    },
  });

  if (typeof window === "undefined") {
    // In case of server, where `window` doesn't exist, we should just return the default state.
    return DEFAULT_AI_STATE;
  }

  const savedAIInfoStateStr = window.localStorage.getItem(AI_INFO_STATE_KEY);
  if (savedAIInfoStateStr) {
    const savedAIInfoState = JSON.parse(savedAIInfoStateStr) as AIInfoState;
    return { ...DEFAULT_AI_STATE, aiInfo: savedAIInfoState };
  } else {
    return DEFAULT_AI_STATE;
  }
}

interface AIStateDispatchers {
  setupDispatcher: Dispatch<SetupReducerAction>;
  aiInfoDispatcher: Dispatch<AIInfoReducerAction>;
}

const AIStateContext = createContext<AIState>({ ...getDefaultAIState() });
const AIStateDispatcherContext = createContext<AIStateDispatchers>({
  setupDispatcher: () => {},
  aiInfoDispatcher: () => {},
});

export function AIStateProvider({ children }: PropsWithChildren<{}>) {
  const [setupState, setupDispatcher] = useReducer(setupReducer, {
    ...getDefaultAIState().setup,
  });
  const [aiInfoState, aiInfoDispatcher] = useReducer(aiInfoReducer, {
    ...getDefaultAIState().aiInfo,
  });

  useEffect(() => {
    setupDispatcher("init_stage");
  }, []);

  return (
    <AIStateContext.Provider value={{ aiInfo: aiInfoState, setup: setupState }}>
      <AIStateDispatcherContext.Provider
        value={{ aiInfoDispatcher, setupDispatcher }}
      >
        {children}
      </AIStateDispatcherContext.Provider>
    </AIStateContext.Provider>
  );
}

export function useAIState() {
  return useContext(AIStateContext);
}

export function useAIStateDispatcher() {
  return useContext(AIStateDispatcherContext);
}

/* Setup State */
interface SetupReducerState {
  stage: "not_init" | "get_token" | "get_ai_info" | "get_ai_goals" | "done";
}
type SetupReducerAction = "init_stage" | "next_stage" | "prev_stage";

const SetupReduceNextStageMap: {
  [key in SetupReducerState["stage"]]: SetupReducerState["stage"];
} = {
  not_init: "get_token",
  get_token: "get_ai_info",
  get_ai_info: "get_ai_goals",
  get_ai_goals: "done",
  done: "done",
};

function setupReducer(
  state: SetupReducerState,
  action: SetupReducerAction
): SetupReducerState {
  if (action === "next_stage") {
    return { ...state, stage: SetupReduceNextStageMap[state.stage] };
  } else if (action === "init_stage") {
    if (!getAPIKey()) {
      return { ...state, stage: "get_token" };
    }

    return { ...state, stage: SetupReduceNextStageMap["get_token"] };
  } else if (action === "prev_stage") {
    const prevState = Object.entries(SetupReduceNextStageMap).find(
      ([, nextState]) => (nextState === state.stage ? true : false)
    );
    if (prevState) {
      return { ...state, stage: prevState[0] as SetupReducerState["stage"] };
    }

    return state;
  } else {
    return assertNever(action);
  }
}

/* AI Info State */

interface AIInfoState {
  name: string;
  description: string;
  goals: string[];
  model: string;
}

type AIInfoReducerAction =
  | { type: "set_name"; name: string }
  | { type: "set_description"; description: string }
  | { type: "set_model"; model: string }
  | { type: "set_goals"; goals: string[] };

function aiInfoReducer(
  state: AIInfoState,
  action: AIInfoReducerAction
): AIInfoState {
  if (action.type === "set_name") {
    return { ...state, name: action.name };
  } else if (action.type === "set_description") {
    return { ...state, description: action.description };
  } else if (action.type === "set_model") {
    return { ...state, model: action.model };
  } else if (action.type === "set_goals") {
    // As setting goals is generally the last stage of AIInfoState
    // so we'll store it in local storage
    const newState = { ...state, goals: action.goals };
    window.localStorage.setItem(AI_INFO_STATE_KEY, JSON.stringify(newState));

    return newState;
  } else {
    return assertNever(action);
  }
}
