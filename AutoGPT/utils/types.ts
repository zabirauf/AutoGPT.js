export interface AIResponseSchema {
  command: {
    name: string;
    args: { [key: string]: string };
  };
  thoughts: {
    text: string;
    reasoning: string;
    plan: string;
    criticism: string;
  };
}

export type ResponseSchema = "YAML" | "JSON";

export type LLMMessage =
  | { role: "system"; content: string; }
  | { role: "assistant"; content: string; }
  | { role: "user"; content: string; };

export type LLMModel =
  | "gpt-3.5-turbo"
  | "gpt-3.5-turbo-0301"
  | "gpt-4"
  | "gpt-4-32k";

export interface AutoGPTConfig {
  models: {
    mainLoopModel: LLMModel;
    schemaFixingModel: LLMModel;
    plugins: {
      codeCreationModel: LLMModel;
      agentModel: LLMModel;
    }
  }
}