import { AutoGPTAction } from 'langchain/experimental/autogpt';
import { BaseOutputParser } from 'langchain/schema';

export function preprocessJsonInput(inputStr: string): string {
  // Replace single backslashes with double backslashes,
  // while leaving already escaped ones intact
  const correctedStr = inputStr.replace(
    /(?<!\\)\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g,
    "\\\\"
  );
  return correctedStr;
}

export interface AutoGPTRawAction extends AutoGPTAction {
  rawParsed: any;
}

export class AutoGPTOutputParser extends BaseOutputParser<AutoGPTRawAction> {
  getFormatInstructions(): string {
    throw new Error("Method not implemented.");
  }

  async parse(text: string): Promise<AutoGPTRawAction> {
    let parsed: {
      command: {
        name: string;
        args: Record<string, unknown>;
      };
    };
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      const preprocessedText = preprocessJsonInput(text);
      try {
        parsed = JSON.parse(preprocessedText);
      } catch (error) {
        return {
          name: "ERROR",
          args: { error: `Could not parse invalid json: ${text}` },
          rawParsed: undefined,
        };
      }
    }
    try {
      return {
        name: parsed.command.name,
        args: parsed.command.args,
        rawParsed: parsed,
      };
    } catch (error) {
      return {
        name: "ERROR",
        args: { error: `Incomplete command args: ${parsed}` },
        rawParsed: parsed,
      };
    }
  }
}
