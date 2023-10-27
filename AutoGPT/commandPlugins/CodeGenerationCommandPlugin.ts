import { callAIFunction } from 'AutoGPT/utils/llmUtils';
import { getConfig } from 'AutoGPT/utils/config';
import type { CommandPlugin } from './CommandPlugin';

async function createCode(descriptionOfCode: string): Promise<string> {
  const functionString = "function createCode(description: string): string {";
  const args = [descriptionOfCode];
  const description =
    "Analyzes the given description and return code in Javascript without types that accomplishes the described goal.";

  const result = await callAIFunction({
    function: functionString,
    args,
    description,
    model: getConfig().models.plugins.codeCreationModel,
  });

  return result;
}

async function evaluateCode(code: string): Promise<string> {
  const functionString = "function analyzeCode(code: string): string[] {";
  const args = [code];
  const description =
    "Analyzes the given code and returns a list of suggestions for improvements.";

  const result = await callAIFunction({
    function: functionString,
    args,
    description,
    model: getConfig().models.plugins.codeCreationModel,
  });

  return result;
}

async function improveCode(
  suggestions: string[],
  code: string
): Promise<string> {
  const functionString =
    "function generateImprovedCode(suggestions: string[], code: string): string {";
  const args = [JSON.stringify(suggestions), code];
  const description =
    "Improves the provided code based on the suggestions provided, making no other changes.";

  const result = await callAIFunction({
    function: functionString,
    args,
    description,
    model: getConfig().models.plugins.codeCreationModel,
  });

  return result;
}

async function writeTests(code: string, focus: string[]): Promise<string> {
  const functionString =
    "function createTestCases(code: string, focus?: string[]): string {";
  const args = [code, JSON.stringify(focus)];
  const description =
    "Generates test cases for the existing code, focusing on specific areas if required.";

  const result = await callAIFunction({
    function: functionString,
    args,
    description,
    model: getConfig().models.plugins.codeCreationModel,
  });

  return result;
}

const CodeGenerationCommandPlugin: CommandPlugin[] = [
  {
    command: "create_code",
    name: "Create Code",
    arguments: {
      description: "description_of_code_to_create",
    },
    argumentsV2: {
      required: ["description"],
      args: {
        description: {
          type: "string",
          description: "Description of the code to create",
        },
      },
    },
    execute: (args) => createCode(args["description"]),
  },
  {
    command: "evaluate_code",
    name: "Evaluate Code",
    arguments: {
      code: "full_code_string",
    },
    argumentsV2: {
      required: ["code"],
      args: {
        code: {
          type: "string",
          description: "Full code to evalute the result for",
        },
      },
    },
    execute: (args) => evaluateCode(args["code"]),
  },
  {
    command: "improve_code",
    name: "Get Improved Code",
    arguments: {
      suggestions: "list_of_suggestions",
      code: "full_code_string",
    },
    argumentsV2: {
      required: ["suggestions", "code"],
      args: {
        code: { type: "string", description: "Full code to improve" },
        suggestions: {
          type: "array",
          items: { type: "string" },
          description:
            "List of suggestion which will be used to improve the code",
        },
      },
    },
    execute: (args) => improveCode(args["suggestions"], args["code"]),
  },
  {
    command: "write_tests",
    name: "Write Tests",
    arguments: {
      code: "full_code_string",
      focus: "list_of_focus_areas",
    },
    argumentsV2: {
      required: ["focus", "code"],
      args: {
        code: { type: "string", description: "Full code to test" },
        focus: {
          type: "string",
          description: "List of focus areas for the test",
        },
      },
    },
    execute: (args) => writeTests(args["code"], args["focus"]),
  },
];
export default CodeGenerationCommandPlugin;
