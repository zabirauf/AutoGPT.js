import type { AutoGPTConfig, LLMModel } from "./types";

const DEFAULT_CONFIG: AutoGPTConfig = {
  models: {
    mainLoopModel: "gpt-3.5-turbo-0301",
    schemaFixingModel: "gpt-3.5-turbo-0301",
    plugins: {
      agentModel: "gpt-3.5-turbo-0301",
      codeCreationModel: "gpt-3.5-turbo-0301",
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
      codeCreationModel: model,
      agentModel: model,
    },
  };
}
