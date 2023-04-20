import { callAIFunction } from './llmUtils';
import { getConfig } from './config';
import { JSON_SCHEMA } from './prompt';

export async function fixAndParseJson(
  jsonStr: string,
  tryToFixWithGpt: boolean = true
): Promise<unknown> {
  try {
    return JSON.parse(jsonStr.replaceAll("\n", "\\n"));
  } catch (e) {
    try {
      // Escaping newlines in the string field values
      const regex = /"(?:[^"\\]|\\[^n])*?"/g;
      const escapedString = jsonStr.replace(regex, (match) =>
        match.replace(/\n/g, "\\\\n")
      );
      return JSON.parse(escapedString);
    } catch (e) {
      try {
        const braceIndex = jsonStr.indexOf("{");
        jsonStr = jsonStr.slice(braceIndex);
        const lastBraceIndex = jsonStr.lastIndexOf("}");
        jsonStr = jsonStr.slice(0, lastBraceIndex + 1);
        return JSON.parse(jsonStr);
      } catch (e) {
        if (tryToFixWithGpt) {
          console.warn(
            "Warning: Failed to parse AI output, attempting to fix.\n If you see this warning frequently, it's likely that your prompt is confusing the AI. Try changing it up slightly."
          );
          const aiFixedJson = await fixJson(jsonStr, JSON_SCHEMA, false);
          if (aiFixedJson !== "failed") {
            return JSON.parse(aiFixedJson);
          } else {
            console.error("Failed to fix ai output, telling the AI.");
            return jsonStr;
          }
        } else {
          throw e;
        }
      }
    }
  }
}

async function fixJson(
  jsonStr: string,
  schema: string,
  debug = false
): Promise<string | "failed"> {
  const functionString =
    "function fixJson(json_str: string, schema:string): string {";
  const args = [jsonStr, schema];
  const description = `Fixes the provided JSON string to make it parseable and fully complient with the provided schema.\n If an object or field specifed in the schema isn't contained within the correct JSON, it is ommited.\n This function is brilliant at guessing when the format is incorrect.`;

  if (jsonStr[0] !== "`") {
    jsonStr = "```json\n" + jsonStr + "\n```";
  }
  const resultString = await callAIFunction({
    function: functionString,
    args,
    description,
    model: getConfig().models.schemaFixingModel,
  });
  if (debug) {
    console.debug("------------ JSON FIX ATTEMPT ---------------");
    console.debug(`Original JSON: ${jsonStr}`);
    console.debug("-----------");
    console.debug(`Fixed JSON: ${resultString}`);
    console.debug("----------- END OF FIX ATTEMPT ----------------");
  }
  try {
    JSON.parse(resultString);
    return resultString;
  } catch {
    return "failed";
  }
}
