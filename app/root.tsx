import tailwindStylesheetUrl from './styles/tailwind.css';
import { Header } from './components/Header';
import type { LinksFunction, V2_MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: V2_MetaFunction = () => {
  return [
    { title: "AutoGPT in Browser" },
    {
      property: "og:title",
      content: "AutoGPT running in Browser",
    },
    {
      name: "description",
      content: "It’s an autonomous AI that can help you achieve any goal you can imagine. It generates tasks, executes them, and learns from the outcomes for optimal results.",
    },
    {
      property: "og:image",
      content: `https://autogptjs.com/website-snapshot.png`
    }
  ];
};


export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Header />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        {/* 100% privacy friendly analytics */}
        <script
          async
          defer
          src="https://scripts.simpleanalyticscdn.com/latest.js"
        ></script>
        <noscript>
          <img
            src="https://queue.simpleanalyticscdn.com/noscript.gif"
            alt=""
            referrerPolicy="no-referrer-when-downgrade"
          />
        </noscript>
      </body>
    </html>
  );
}
