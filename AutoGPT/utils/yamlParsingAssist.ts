import { callAIFunction } from './llmUtils';
import { getConfig } from './config';
import { parse as parseYAML } from 'yaml';
import { YAML_SCHEMA } from './prompt';

export async function fixAndParseYAML(
  yamlStr: string,
  tryToFixWithGpt: boolean = true
): Promise<unknown> {
  try {
    return parseYAML(yamlStr);
  } catch (e) {
    try {
      const commandIndex = yamlStr.indexOf("command:");
      yamlStr = yamlStr.slice(commandIndex);
      return parseYAML(yamlStr);
    } catch (e) {
      if (tryToFixWithGpt) {
        console.warn(
          "Warning: Failed to parse AI output, attempting to fix.\n If you see this warning frequently, it's likely that your prompt is confusing the AI. Try changing it up slightly."
        );
        const aiFixedYAML = await fixYAML(yamlStr, YAML_SCHEMA, false);
        if (aiFixedYAML !== "failed") {
          return parseYAML(aiFixedYAML);
        } else {
          console.error("Failed to fix ai output, telling the AI.");
          return yamlStr;
        }
      } else {
        throw e;
      }
    }
  }
}

async function fixYAML(
  yamlStr: string,
  schema: string,
  debug = false
): Promise<string | "failed"> {
  const functionString =
    "function fixYAML(yaml_str: string, schema:string): string {";
  const args = [yamlStr, schema];
  const description = `Fixes the provided YAML string to make it parsable and fully compliant with the provided schema.\n If an object or field specified in the schema isn't contained within the correct YAML, it is omitted.\n This function is brilliant at guessing when the format is incorrect.`;

  if (yamlStr[0] !== "`") {
    yamlStr = "```yaml\n" + yamlStr + "\n```";
  }
  const resultString = await callAIFunction({
    function: functionString,
    args,
    description,
    model: getConfig().models.schemaFixingModel,
  });
  if (debug) {
    console.debug("------------ YAML FIX ATTEMPT ---------------");
    console.debug(`Original YAML: ${yamlStr}`);
    console.debug("-----------");
    console.debug(`Fixed YAML: ${resultString}`);
    console.debug("----------- END OF FIX ATTEMPT ----------------");
  }
  try {
    parseYAML(resultString);
    return resultString;
  } catch {
    return "failed";
  }
}
