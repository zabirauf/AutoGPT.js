import { HowToUseWithTokenRequest } from "~/components/HowToUseWithTokenRequest";
import { AIGoalsForm, AIInfoForm } from "~/components/AIStarterForms";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { AIStateProvider, useAIState } from "~/components/AIStateProvider";
import { AutoGPTChatLoop } from "~/components/AutoGPTChatLoop";

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
        <HowToUseWithTokenRequest />
      )}
      {setup.stage === "get_ai_info" && <AIInfoForm />}
      {setup.stage === "get_ai_goals" && <AIGoalsForm />}
      {setup.stage === "done" && <AutoGPTChatLoop />}
    </>
  );
}
