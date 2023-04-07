import { useCallback, useRef } from "react";
import { useAIState, useAIStateDispatcher } from "./AIStateProvider";

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
    <div className="bg-white shadow sm:rounded-lg sm:w-96">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          AI Information
        </h3>
        <form className="mt-5 sm:flex flex-col sm:items-center">
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

          <div className="w-full mt-4 sm:max-w-xs">
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
                className="block w-full h-48 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder={aiInfo.description}
              />
            </div>
          </div>


          <div className="w-full mt-4 sm:max-w-xs flex flex-row-reverse">
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

  const onDoneButtonClicked = useCallback(() => {
    const goals = goalsRef.current?.value;
    if (goals) {
      aiInfoDispatcher({ type: "set_goals", goals: goals.split('\n') });
    }

    setupDispatcher("next_stage");
  }, []);

  const onBackButtonClicked = useCallback(() => {
    setupDispatcher("prev_stage");
  }, []);

  return (
    <div className="bg-white shadow sm:rounded-lg sm:w-96">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          AI Goals
        </h3>
        <form className="mt-5 sm:flex flex-col sm:items-center">
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
                className="block w-full h-48 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder={aiInfo.goals.join('\n')}
              />
            </div>
          </div>


          <div className="w-full mt-4 sm:max-w-xs flex flex-row-reverse">
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