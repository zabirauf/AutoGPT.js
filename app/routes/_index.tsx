import type { V2_MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";


export const meta: V2_MetaFunction = () => [{ title: "Remix Notes" }];

export default function Index() {
  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <h1>Hello world!</h1>
          </div>
        </div>
      </div>
    </main>
  );
}
