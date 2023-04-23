import { callProxyAndReturnFromDocument } from 'AutoGPT/utils/proxy';
import { Tool } from 'langchain/tools';

export class DuckDuckGoSerpAPI extends Tool {
  name = "duckduckgo-search";

  description =
    "a search engine. useful for when you need to answer questions about current events. input should be a search query.";

  /** @ignore */
  _call(input: string): Promise<string> {
    return callProxyAndReturnFromDocument(
      `https://html.duckduckgo.com/html/?q=${encodeURI(input)}`,
      (doc) => {
        const results = doc.body.querySelectorAll(".result .links_main");

        const resultsToReturn: string[] = [];
        for (const result of results) {
          try {
            const anchor = result.querySelector(
              ".result__title a"
            ) as HTMLElement | null;
            const snippet = (
              result.querySelector(".result__snippet") as HTMLElement
            )?.innerText;
            if (anchor) {
              const url = new URL(
                `https://${anchor.getAttribute("href")}`
              ).searchParams.get("uddg");
              const title = anchor.innerText;

              resultsToReturn.push(`URL: ${url}\nSnippet:${snippet}`);
            }
          } catch {}
        }

        return resultsToReturn.slice(0,3).join("\n\n");
      }
    );
  }
}
