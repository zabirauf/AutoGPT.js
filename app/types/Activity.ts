import { AIResponseSchema } from 'AutoGPT/utils/jsonParsingAssist';

export interface SystemInfoActivity {
  id: string;
  type: "system:info";
  prompt: string;
}
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
export interface ChatCommandErrorActivity {
  id: string;
  type: "chat:command:error";
  error: string;
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
  | SystemInfoActivity
  | ChatCommandActivity
  | ChatCommandCodeActivity
  | ChatCommandExecutedActivity
  | ChatCommandErrorActivity
  | AppAskUserActivity
  | LoadingActivity;
