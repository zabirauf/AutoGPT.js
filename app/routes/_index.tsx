import { useCallback, useEffect, useReducer, useState } from "react";
import { TokenRequest } from "~/components/TokenRequest";
import { getAPIKey } from "AutoGPT/utils/apiKey";
import { AIGoalsForm, AIInfoForm } from "~/components/AIStarterForms";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { assertNever } from "~/utils/asserts";
import { AIStateProvider, useAIState, useAIStateDispatcher } from "~/components/AIStateProvider";

export default function Index() {
  return (
    <AIStateProvider>
      <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
        <div className="relative sm:pb-16 sm:pt-8">
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
              <AISetup />
            </div>
          </div>
        </div>
      </main>
    </AIStateProvider>
  );
}

function AISetup() {
  const { setup } = useAIState();

  return (
    <>
      {setup.stage === "not_init" && <LoadingSpinner />}
      {setup.stage === "get_token" && (
        <TokenRequest />
      )}
      {setup.stage === "get_ai_info" && <AIInfoForm />}
      {setup.stage === "get_ai_goals" && <AIGoalsForm />}
      {setup.stage === "done" && <div>Yepeee!!</div>}
    </>
  );
}
