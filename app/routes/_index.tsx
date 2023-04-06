import { useEffect } from 'react';
import { CommandPlugins } from "~/commandPlugins";
import { chatWithAI } from "~/utils/chat";
import { generatePrompt } from "~/utils/prompt";
import { countStringTokens } from '~/utils/tokenCounter';

export default function Index() {
  useEffect(() => {
    console.log(chatWithAI);
    console.log(CommandPlugins);
    console.log(generatePrompt());
    console.log(countStringTokens("Hello world", "gpt-3.5-turbo-0301"));
  }, []);
  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <h1>Hello world!</h1>
          </div>
        </div>
      </div>
    </main>
  );
}
