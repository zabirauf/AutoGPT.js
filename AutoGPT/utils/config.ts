import type { AutoGPTConfig, LLMModel } from "./types";

const DEFAULT_CONFIG: AutoGPTConfig = {
  models: {
    mainLoopModel: "gpt-4",
    schemaFixingModel: "gpt-4",
    plugins: {
      agentModel: "gpt-3.5-turbo-16k",
      browserModel: "gpt-3.5-turbo-16k",
      codeCreationModel: "gpt-4",
    },
  },
};

let config: AutoGPTConfig = DEFAULT_CONFIG;

export function initConfig(configToSet: AutoGPTConfig): void {
  config = configToSet;
}

export function getConfig() {
  return config;
}

export function updatePartialConfig(
  partialConfig: Partial<AutoGPTConfig>
): void {
  config = { ...config, ...partialConfig };
}

export function getModelConfigWithModel(
  model: LLMModel
): AutoGPTConfig["models"] {
  return {
    mainLoopModel: model,
    schemaFixingModel: model,
    plugins: {
      agentModel: model,
      browserModel: model,
      codeCreationModel: model,
    },
  };
}
