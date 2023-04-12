import { PauseCircleIcon, PlayCircleIcon } from "@heroicons/react/20/solid";

export interface PauseButtonProps {
  onClick: () => void;
}
export function PauseButton({ onClick }: PauseButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-x-2 rounded-md bg-amber-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
      onClick={onClick}
    >
      <PauseCircleIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
      Pause chat
    </button>
  );
}

export interface ResumeButtonProps {
  onClick: () => void;
}
export function ResumeButton({ onClick }: ResumeButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-x-2 rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
      onClick={onClick}
    >
      <PlayCircleIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
      Resume chat
    </button>
  );
}
