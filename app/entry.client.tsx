import wasmBinary from '@dqbd/tiktoken/tiktoken_bg.wasm';
import { hydrateRoot } from 'react-dom/client';
import { init } from '@dqbd/tiktoken/init';
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
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <RemixBrowser />
      </StrictMode>
    );
  });
});
