import wasmBinary from "@dqbd/tiktoken/tiktoken_bg.wasm";
import { createRoot, hydrateRoot } from "react-dom/client";
import { init } from "@dqbd/tiktoken/init";
import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { initFileHandlerOperations } from "AutoGPT/commandPlugins/FileOperationCommandPlugins";
import { AskFilePermission } from "./components/AskFilePermission";
/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/docs/en/main/file-conventions/entry.client
 */

init((imports) =>
  WebAssembly.instantiateStreaming(fetch(wasmBinary as any), imports)
).then(() => {
  initFileHandlerOperations({
    getDirectoryHandle,
  });
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
      directoryHandle = await window.showDirectoryPicker();
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
