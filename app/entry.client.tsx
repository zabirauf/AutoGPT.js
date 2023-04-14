import wasmBinary from '@dqbd/tiktoken/tiktoken_bg.wasm';
import { AskFilePermission } from './components/AskFilePermission';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { init } from '@dqbd/tiktoken/init';
import { initBrowserCommandPlugins } from 'AutoGPT/commandPlugins/BrowserCommandPlugins';
import { initFileOperationCommandPlugins } from 'AutoGPT/commandPlugins/FileOperationCommandPlugins';
import { RemixBrowser } from '@remix-run/react';
import { startTransition, StrictMode } from 'react';
/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/docs/en/main/file-conventions/entry.client
 */

init((imports) =>
  WebAssembly.instantiateStreaming(fetch(wasmBinary as any), imports)
).then(() => {
  initFileOperationCommandPlugins({
    getDirectoryHandle,
  });
  initBrowserCommandPlugins({ callProxy });
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <RemixBrowser />
      </StrictMode>
    );
  });
});

async function getDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  return new Promise((resolve) => {
    const containerElement = document.createElement("div");
    document.body.appendChild(containerElement);
    const root = createRoot(containerElement);
    let directoryHandle: FileSystemDirectoryHandle | null = null;
    const onUserApprovedPermission = async () => {
      if (!!window.showDirectoryPicker) {
        directoryHandle = await window.showDirectoryPicker();
      } else {
        // If the user directory picker is not available then fallback to using
        // origin private file system
        directoryHandle = await window.navigator.storage.getDirectory();
      }
    };
    const onDone = () => {
      resolve(directoryHandle);
      document.body.removeChild(containerElement);
    };
    root.render(
      <AskFilePermission
        onUserApprovedPermission={onUserApprovedPermission}
        onDone={onDone}
      />
    );
  });
}

async function callProxy(
  url: string
): Promise<
  { status: "ok"; text: string } | { status: "error"; error: string }
> {
  const proxyAPIUrl = new URL(
    "/proxy",
    `${window.location.protocol}//${window.location.host}`
  );
  proxyAPIUrl.searchParams.set("url", url);
  try {
    const response = await fetch(proxyAPIUrl.toString(), { method: "GET" });
    if (response.ok) {
      return { status: "ok", text: await response.text() };
    } else if (response.status === 520) {
      const jsonBody = await response.json();
      return { status: "error", error: `Error: HTTP ${jsonBody.status} error` };
    } else {
      return { status: "error", error: "Error: unable to visit website" };
    }
  } catch (error) {
    console.log("Error calling proxy", error);
    return { status: "error", error: "Error: unable to visit website" };
  }
}
