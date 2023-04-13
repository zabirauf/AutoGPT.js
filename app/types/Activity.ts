import { AIResponseSchema } from 'AutoGPT/utils/jsonParsingAssist';

export interface ChatCommandActivity {
  id: string;
  type: "chat:command";
  response: AIResponseSchema;
}
export interface ChatCommandCodeActivity {
  id: string;
  type: "chat:command:code";
  response: AIResponseSchema;
  code: string;
}
export interface ChatCommandExecutedActivity {
  id: string;
  type: "chat:command:executed";
  executionResponse: string;
}
export interface AppAskUserActivity {
  id: string;
  type: "app:ask_user";
}
export interface LoadingActivity {
  id: string;
  type: "app:loading";
}

export type Activity =
  | ChatCommandActivity
  | ChatCommandCodeActivity
  | ChatCommandExecutedActivity
  | AppAskUserActivity
  | LoadingActivity;
