import { callLLMChatCompletion } from 'AutoGPT/utils/llmUtils';
import { CommandPlugin } from './CommandPlugin';
import type { LLMMessage } from "AutoGPT/utils/types";

let callProxyFn: (
  url: string
) => Promise<
  { status: "ok"; text: string } | { status: "error"; error: string }
>;

export function initBrowserCommandPlugins({
  callProxy,
}: {
  callProxy: typeof callProxyFn;
}) {
  callProxyFn = callProxy;
}

async function callProxyAndReturnFromDocument<T>(
  url: string,
  getStringFromDocument: (doc: Document) => T
) {
  const response = await callProxyFn(url);
  if (response.status === "error") {
    return response.error;
  }

  try {
    const respDom = new DOMParser();
    const doc = await respDom.parseFromString(response.text, "text/html");
    return getStringFromDocument(doc);
  } catch (error) {
    console.error("Error parsing HTML from website", error);
    return "Error: Unable to parse website HTML";
  }
}

function scrapText(url: string): Promise<string> {
  return callProxyAndReturnFromDocument(url, (doc) => doc.body.innerText);
}

function scrapLinks(url: string): Promise<string | string[]> {
  return callProxyAndReturnFromDocument(url, (doc) => {
    const linksStr = [];
    const hyperlinks = doc.body.querySelectorAll("a");
    for (const link of hyperlinks) {
      const href = link.getAttribute("href");
      let src = href;
      if (!!href && (href[0] === "/" || !href.startsWith("http"))) {
        try {
          src = new URL(href, url).toString();
        } catch {}
      }
      linksStr.push(`<a href="${src}">${link.innerText}</a>`);
    }
    return linksStr;
  });
}

function* splitText(text: string, maxLength = 8192): Generator<string> {
  const paragraphs = text.split("\n");
  let currentLength = 0;
  let currentChunk: string[] = [];

  for (const paragraph of paragraphs) {
    if (currentLength + paragraph.length + 1 <= maxLength) {
      currentChunk.push(paragraph);
      currentLength += paragraph.length + 1;
    } else {
      yield currentChunk.join("\n");
      currentChunk = [paragraph];
      currentLength = paragraph.length + 1;
    }
  }

  if (currentChunk.length > 0) {
    yield currentChunk.join("\n");
  }
}

async function summarizeText(text: string, isWebsite = true): Promise<string> {
  if (text === "") {
    return "Error: No text to summarize";
  }

  console.log(`Text length: ${text.length} characters`);
  const summaries: string[] = [];
  const chunks = splitText(text);

  for (const chunk of chunks) {
    const messages: LLMMessage[] = isWebsite
      ? [
          {
            role: "user",
            content: `Please summarize the following website text, do not describe the general website, but instead concisely extract the specific information this subpage contains:\n\n 
              ${chunk}`,
          },
        ]
      : [
          {
            role: "user",
            content: `Please summarize the following text, focusing on extracting concise and specific information:\n\n
              ${chunk}`,
          },
        ];

    const summary = await callLLMChatCompletion(
      messages,
      "gpt-3.5-turbo",
      undefined /* temperature */,
      300 /* maxTokens */
    );

    summaries.push(summary);
  }

  if (summaries.length === 1) {
    // If there is only a single summary then return that
    return summaries[0];
  }

  const combinedSummary = summaries.join("\n");
  const messages: LLMMessage[] = isWebsite
    ? [
        {
          role: "user",
          content: `Please summarize the following website text, do not describe the general website, but instead concisely extract the specific information this subpage contains:\n\n 
            ${combinedSummary}`,
        },
      ]
    : [
        {
          role: "user",
          content: `Please summarize the following text, focusing on extracting concise and specific information:\n\n
            ${combinedSummary}`,
        },
      ];

  const finalSummary = await callLLMChatCompletion(
    messages,
    "gpt-3.5-turbo",
    undefined /* temperature */,
    300 /* maxTokens */
  );
  return finalSummary;
}

const BrowserCommandPlugins: CommandPlugin[] = [
  {
    command: "browse_website",
    name: "Browse Website",
    arguments: {
      url: "url",
    },
    execute: async (args) => {
      const url = args["url"];
      const websiteText = await scrapText(url);
      const summary = await summarizeText(websiteText);
      let linksOrError = await scrapLinks(url);

      if (typeof linksOrError === "string") {
        // Error, so we'll return that
        return linksOrError;
      }

      return `Website Content Summary:\n ${summary}\n\nLinks:\n ${linksOrError
        .slice(0, 10)
        .join("\n")}`;
    },
  },
];

export default BrowserCommandPlugins;
