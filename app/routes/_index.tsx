import { useCallback, useEffect, useState } from 'react';
import { CommandPlugins } from "~/commandPlugins";
import { chatWithAI } from "~/utils/chat";
import { generatePrompt } from "~/utils/prompt";
import { countStringTokens } from "~/utils/tokenCounter";
import { TokenRequest } from "~/components/TokenRequest";
import { getAPIKey } from "~/utils/apiKey";
import { StarterData } from '~/components/StaterData';

export default function Index() {
  useEffect(() => {
    console.log(chatWithAI);
    console.log(CommandPlugins);
    console.log(generatePrompt());
    console.log(countStringTokens("Hello world", "gpt-3.5-turbo-0301"));
  }, []);

  const [hasToken, setHasToken] = useState<boolean>(false);
  useEffect(() => setHasToken(!!getAPIKey()), []);
  const onTokenSaved = useCallback(() => {
    setHasToken(!!getAPIKey());
  }, []);

  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            {!hasToken ? <TokenRequest onTokenSaved={onTokenSaved} /> : <StarterData />}
          </div>
        </div>
      </div>
    </main>
  );
}
