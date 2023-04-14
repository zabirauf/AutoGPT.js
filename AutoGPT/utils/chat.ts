import { callLLMChatCompletion, LLMMessage, LLMModel } from './llmUtils';
import { Config } from './config';
import { countMessageTokens } from './tokenCounter';

interface ChatWithAiArgs {
  prompt: string;
  userInput: string;
  fullMessageHistory: LLMMessage[];
  appendToFullMessageHistory: (messages: LLMMessage[]) => void;
  permanentMemory: string[];
  tokenLimit: number;
  model?: LLMModel;
  debug?: boolean;
}

export async function chatWithAI({
  prompt,
  userInput,
  fullMessageHistory,
  appendToFullMessageHistory,
  permanentMemory,
  tokenLimit,
  model,
  debug = false,
}: ChatWithAiArgs): Promise<string> {
  try {
    model = model ?? Config.smart_llm_model;
    const sendTokenLimit = tokenLimit - 1000;

    const currentContext: LLMMessage[] = [
      { role: "system", content: prompt },
      { role: "system", content: `Permanent memory: ${permanentMemory}` },
    ];

    let nextMessageToAddIndex = fullMessageHistory.length - 1;
    let currentTokensUsed = 0;
    const insertionIndex = currentContext.length;

    currentTokensUsed = countMessageTokens(currentContext, model);
    currentTokensUsed += countMessageTokens(
      [{ role: "user", content: userInput }],
      model
    );

    while (nextMessageToAddIndex >= 0) {
      const messageToAdd = fullMessageHistory[nextMessageToAddIndex];
      const tokensToAdd = countMessageTokens([messageToAdd], model);

      if (currentTokensUsed + tokensToAdd > sendTokenLimit) {
        break;
      }

      currentContext.splice(
        insertionIndex,
        0,
        fullMessageHistory[nextMessageToAddIndex]
      );
      currentTokensUsed += tokensToAdd;
      nextMessageToAddIndex -= 1;
    }

    currentContext.push({ role: "user", content: userInput });
    const tokensRemaining = tokenLimit - currentTokensUsed;

    if (debug) {
      console.log(`Token limit: ${tokenLimit}`);
      console.log(`Send Token Count: ${currentTokensUsed}`);
      console.log(`Tokens remaining for response: ${tokensRemaining}`);
      console.log("------------ CONTEXT SENT TO AI ---------------");
      for (const message of currentContext) {
        if (message.role === "system" && message.content === prompt) {
          continue;
        }
        console.log(
          `${message.role.charAt(0).toUpperCase() + message.role.slice(1)}: ${
            message.content
          }`
        );
        console.log();
      }
      console.log("----------- END OF CONTEXT ----------------");
    }

    const assistantReply = await callLLMChatCompletion(
      currentContext,
      model,
      undefined /* temperature */,
      tokensRemaining
    );

    appendToFullMessageHistory([
      { role: "user", content: userInput },
      {
        role: "assistant",
        content: assistantReply,
      },
    ]);

    return assistantReply;
  } catch (error) {
    console.error("Error calling chat", error);
    throw error;
  }
}
