export interface AIResponseSchema {
  command: {
    name: string;
    args: { [key: string]: string };
  };
  thoughts: {
    text: string;
    reasoning: string;
    plan: string;
    criticism: string;
  };
}

export type ResponseSchema = "YAML" | "JSON";

