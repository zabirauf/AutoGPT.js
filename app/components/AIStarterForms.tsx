import { Config } from 'AutoGPT/utils/config';
import { useAIState, useAIStateDispatcher } from './AIStateProvider';
import { useCallback, useRef } from 'react';

export function AIInfoForm() {
  const { aiInfo } = useAIState();
  const { setupDispatcher, aiInfoDispatcher } = useAIStateDispatcher();

  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const onNextButtonClicked = useCallback(() => {
    const name = nameRef.current?.value;
    if (name) {
      aiInfoDispatcher({ type: "set_name", name });
    }

    const description = descriptionRef.current?.value;
    if (description) {
      aiInfoDispatcher({ type: "set_description", description });
    }

    setupDispatcher("next_stage");
  }, []);

  const onBackButtonClicked = useCallback(() => {
    setupDispatcher("prev_stage");
  }, []);

  return (
    <div className="bg-white shadow sm:w-96 sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          AI Information
        </h3>
        <form className="mt-5 flex-col sm:flex sm:items-center">
          <div className="w-full sm:max-w-xs">
            <label
              htmlFor="name"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Name of your AI
            </label>
            <div className="mt-2">
              <input
                ref={nameRef}
                type="text"
                name="name"
                id="name"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder={aiInfo.name}
              />
            </div>
          </div>

          <div className="mt-4 w-full sm:max-w-xs">
            <label
              htmlFor="description"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Describe your AI's role
            </label>
            <div className="mt-2">
              <textarea
                ref={descriptionRef}
                name="description"
                id="description"
                className="block h-48 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder={aiInfo.description}
              />
            </div>
          </div>

          <div className="mt-4 flex w-full flex-row-reverse sm:max-w-xs">
            <button
              type="button"
              className="mt-3 inline-flex w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
              onClick={onNextButtonClicked}
            >
              Next
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
              onClick={onBackButtonClicked}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AIGoalsForm() {
  const { aiInfo } = useAIState();
  const { setupDispatcher, aiInfoDispatcher } = useAIStateDispatcher();

  const goalsRef = useRef<HTMLTextAreaElement>(null);
  const modelSelectorRef = useRef<HTMLSelectElement>(null);

  const onDoneButtonClicked = useCallback(() => {
    const model = modelSelectorRef.current?.value;
    if (model) {
      aiInfoDispatcher({ type: "set_model", model });
    }

    const goals = goalsRef.current?.value;
    if (goals) {
      aiInfoDispatcher({ type: "set_goals", goals: goals.split("\n") });
    }

    setupDispatcher("next_stage");
  }, []);

  const onBackButtonClicked = useCallback(() => {
    setupDispatcher("prev_stage");
  }, []);

  return (
    <div className="bg-white shadow sm:w-96 sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          AI Goals
        </h3>
        <form className="mt-5 flex-col sm:flex sm:items-center">
          <div className="w-full sm:max-w-xs">
            <label
              htmlFor="goals"
              className="block text-sm font-medium leading-6 text-gray-600"
            >
              List down each goal in new line
            </label>
            <div className="mt-2">
              <textarea
                ref={goalsRef}
                name="goals"
                id="goals"
                className="block h-48 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder={aiInfo.goals.join("\n")}
              />
            </div>
          </div>

          <div className="mt-4 w-full sm:max-w-xs">
            <label
              htmlFor="location"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              OpenAI model to use
            </label>
            <select
              id="location"
              name="location"
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              defaultValue={Config.fast_llm_model}
              ref={modelSelectorRef}
            >
              <option value={Config.fast_llm_model}>GPT 3.5-turbo</option>
              <option value={Config.smart_llm_model}>GPT 4</option>
            </select>
          </div>

          <div className="mt-4 flex w-full flex-row-reverse sm:max-w-xs">
            <button
              type="button"
              className="mt-3 inline-flex w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
              onClick={onDoneButtonClicked}
            >
              Done
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
              onClick={onBackButtonClicked}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
