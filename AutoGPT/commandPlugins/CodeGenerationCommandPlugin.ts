import { CommandPlugin } from "./CommandPlugin";
import { callAIFunction } from "../utils/llmUtils";

async function evaluateCode(code: string): Promise<string> {
  const functionString = "function analyzeCode(code: string): string[] {";
  const args = [code];
  const description =
    "Analyzes the given code and returns a list of suggestions for improvements.";

  const result = await callAIFunction({
    function: functionString,
    args,
    description,
  });

  return result;
}

async function improveCode(suggestions: string[], code: string): Promise<string> {
  const functionString = "function generateImprovedCode(suggestions: string[], code: string): string {";
  const args = [JSON.stringify(suggestions), code];
  const description = "Improves the provided code based on the suggestions provided, making no other changes.";

  const result = await callAIFunction({
    function: functionString,
    args,
    description,
  });

  return result;
}

async function writeTests(code: string, focus: string[]): Promise<string> {
  const functionString = "function createTestCases(code: string, focus?: string[]): string {";
  const args = [code, JSON.stringify(focus)];
  const description = "Generates test cases for the existing code, focusing on specific areas if required.";

  const result = await callAIFunction({
    function: functionString,
    args,
    description,
  });

  return result;
}

const CodeGenerationCommandPlugin: CommandPlugin[] = [
  {
    command: "evaluate_code",
    name: "Evaluate Code",
    arguments: {
      code: "full_code_string",
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
    execute: (args) => improveCode(args["suggestions"], args["code"]),
  },
  {
    command: "write_tests",
    name: "Write Tests",
    arguments: {
      code: "full_code_string",
      focus: "list_of_focus_areas",
    },
    execute: (args) => writeTests(args["code"], args["focus"])
  },
];
export default CodeGenerationCommandPlugin;
