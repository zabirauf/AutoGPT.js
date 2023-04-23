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

export async function callProxyAndReturnFromDocument<T>(
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