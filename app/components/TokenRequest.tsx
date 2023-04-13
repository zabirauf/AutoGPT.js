import { useCallback, useRef } from 'react';
import { setAPIKey, getAPIKey } from "AutoGPT/utils/apiKey";
import { useAIStateDispatcher } from './AIStateProvider';

export function TokenRequest() {
  const { setupDispatcher } = useAIStateDispatcher();
  const tokenRef = useRef<HTMLInputElement>(null);
  const onSaveClicked = useCallback(() => {
    if (tokenRef.current?.value) {
      setAPIKey(tokenRef.current?.value);
    }

    if (getAPIKey()) {
      // Only go to next stage if there is an API key present
      setupDispatcher("next_stage")
    }
  }, [setupDispatcher]);

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          OpenAI token
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            The token is only stored on browser and is directly used to call
            OpenAI APIs.
          </p>
        </div>
        <form className="mt-5 sm:flex sm:items-center">
          <div className="w-full sm:max-w-xs">
            <label htmlFor="token" className="sr-only">
              Token
            </label>
            <input
              ref={tokenRef}
              type="text"
              name="token"
              id="token"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder={getAPIKey() ?? "sk-1234..."}
            />
          </div>
          <button
            type="button"
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
            onClick={onSaveClicked}
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
