import wasmBinary from '@dqbd/tiktoken/tiktoken_bg.wasm';
import { AskFilePermission } from './components/AskFilePermission';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { init } from '@dqbd/tiktoken/init';
import { initFileHandlerOperations } from 'AutoGPT/commandPlugins/FileOperationCommandPlugins';
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
