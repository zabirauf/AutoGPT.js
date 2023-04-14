import normalizeUrl from 'normalize-url';
import type { LoaderArgs } from "@remix-run/node";

export async function loader({ request }: LoaderArgs) {
  const requestUrl = new URL(request.url);
  const urlParam = requestUrl.searchParams.get("url");
  if (!urlParam) {
    return new Response("No URL provided", { status: 400 /* Bad Request */ });
  }

  try {
    const url = new URL(normalizeUrl(urlParam));

    const proxiedResponse = await fetch(url.toString(), { method: "GET" });

    if (!proxiedResponse.ok) {
      console.log("Proxy ❌", `Got response ${proxiedResponse.status}`);
      return new Response(
        JSON.stringify({
          error: `Unable to visit website, got status ${proxiedResponse.status}`,
          status: proxiedResponse.status,
        }),
        { status: 520 /* Web server returned unknown error */ }
      );
    }

    const textBody = await proxiedResponse.text();
    return new Response(textBody, { status: 200 });
  } catch (error: unknown) {
    console.log("Proxy ❌", { error });
    return new Response("ERROR", { status: 500 });
  }
}
