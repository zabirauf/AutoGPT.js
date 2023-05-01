import { AIResponseSchema } from 'AutoGPT/utils/types';
import { AutoGPT, AutoGPTAction } from 'langchain/experimental/autogpt';
import { BrowserFilesStore } from 'AutoGPT/langchain/stores';
import { CallbackManagerForToolRun } from 'langchain/dist/callbacks';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { DuckDuckGoSerpAPI } from 'AutoGPT/langchain/tools';
import { getAPIKey } from 'AutoGPT/utils/apiKey';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { ReadFileTool, Tool, WriteFileTool } from 'langchain/tools';
import {
  useCallback,
  useEffect,
  useRef,
  useState
  } from 'react';
import {
  AutoGPTOutputParser,
  AutoGPTRawAction,
} from "AutoGPT/langchain/output_parsers/AutoGPTOutputParser";
import { Activity } from "~/types/Activity";
import { useAIState } from "~/components/AIStateProvider";
import { generateID } from "~/utils/generateID";

function wait(timeoutInMS: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeoutInMS);
  });
}

class PauseableTool extends Tool {
  name = "PauseableTool";
  description = "Tool that pauses the workflow";
  private isStopped = false;
  constructor(private isPaused: () => boolean) {
    super();
  }
  protected async _call(
    arg: any,
    callbackManager?: CallbackManagerForToolRun | undefined
  ): Promise<string> {
    if (this.isStopped) {
      return "stop";
    } else if (!this.isPaused()) {
      return "continue";
    } else {
      while (this.isPaused() || !this.isStopped) {
        await wait(1000);
      }
      return this.isStopped ? "stop" : "continue";
    }
  }

  public stop() {
    this.isStopped = true;
  }
}

class WrappedAutoGPTOutputParser extends AutoGPTOutputParser {
  constructor(private addActivity: (activity: Activity) => void) {
    super();
  }

  async parse(text: string): Promise<AutoGPTRawAction> {
    const action = await super.parse(text);

    if (action.name === "ERROR") {
      this.addActivity({
        id: generateID(),
        type: "chat:command:error",
        error: action.args["error"],
      });
    } else {
      this.addActivity({
        id: generateID(),
        type: "chat:command",
        response: action.rawParsed as AIResponseSchema,
      });
    }

    return action;
  }
}

export function useLangChainAutoGPT(
  addActivity: (activity: Activity) => void,
  onTaskCompleted: () => void
) {
  const { aiInfo } = useAIState();
  const isRunning = useRef(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const isPausedRef = useRef<boolean>(isPaused);
  const togglePause = useCallback(() => {
    // Toggle paused
    setIsPaused(!isPaused);
    isPausedRef.current = !isPaused;
  }, [isPaused]);

  useEffect(() => {
    if (isRunning.current) {
      return;
    }
    isRunning.current = true;
    const store = new BrowserFilesStore();

    const tools = [
      new ReadFileTool({ store }),
      new WriteFileTool({ store }),
      new DuckDuckGoSerpAPI(),
    ];
    const vectorStore = new MemoryVectorStore(
      new OpenAIEmbeddings({ openAIApiKey: getAPIKey() ?? undefined })
    );

    const autogpt = AutoGPT.fromLLMAndTools(
      new ChatOpenAI({
        temperature: 0,
        openAIApiKey: getAPIKey() ?? undefined,
      }),
      tools,
      {
        memory: vectorStore.asRetriever(),
        aiName: aiInfo.name,
        aiRole: aiInfo.description,
      }
    );

    const pauseableTool = new PauseableTool(() => isPausedRef.current);
    autogpt.feedbackTool = pauseableTool;
    autogpt.outputParser = new WrappedAutoGPTOutputParser(addActivity);
    autogpt.run(aiInfo.goals).then(() => {
      onTaskCompleted();
    }).catch(error => {
        console.error("Running AutoGPT resuled in error", error);
        pauseableTool.stop();
        onTaskCompleted();
    });
  }, []);

  return { isPaused, togglePause };
}
