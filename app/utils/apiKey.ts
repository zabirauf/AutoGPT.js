let OPENAI_API_KEY: string | null = null;

export function getAPIKey() {
    return OPENAI_API_KEY;
}

export function setAPIKey(apiKey: string) {
    OPENAI_API_KEY = apiKey;
}