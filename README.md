# AutoGPT.js

AutoGPT.js is an open-source project that aims to bring the powerful capabilities of AutoGPT to your browser. By running directly in the browser, AutoGPT.js offers greater accessibility and privacy.

Visit [AutoGPTjs.com](https://autogptjs.com)

![Website snapshot](docs/website-snapshot.png)

## Table of Contents

- [Features](#features)
- [Roadmap/Ideas](#roadmapideas)
- [Development](#development)
- [Deployment](#deployment)
  - [Fly.io](#flyio)
  - [Docker](#docker)
  - [Direct](#direct)
- [Contributing](#contributing)
- [License](#license)


## Features

- Create/Read files from your local computer (uses new Web File System Access APIs)
- Create and run other GPT agents
- Generates code
- Short term memory
- Searching using Duck Duck Go (currently proxies fetching of DuckDuckGo page through server)
- Stateless visiting a URL (currently proxies fetching of website through server)

## Roadmap/Ideas

- 🚧 Using LangChain for a more extensible architecture for AutoGPT
- Advance settings to configure the AutoGPT e.g. Temperature, Prompt etc.
- Running JS code in a sandbox (e.g. `iframe`)
- Switching to different LLM APIs e.g. Bard, Cohere etc.
- Integrating Web based LLMs e.g. WebLLM, LLaMa in browser etc. (currently performance maybe a limitation)
- Tabbed UX to show Files Created/Accessed

## Development

1. Copy `.env.example` to `.env` and change as necessary.
2. Run `npm install` to get all the dependencies.
3. Run `npm run dev` to start the development server.

## Deployment

### Fly.io

- [Install Fly](https://fly.io/docs/getting-started/installing-flyctl/)

- Sign up and log in to Fly

  ```sh
  fly auth signup
  ```

  > **Note:** If you have more than one Fly account, ensure that you are signed into the same account in the Fly CLI as you are in the browser. In your terminal, run `fly auth whoami` and ensure the email matches the Fly account signed into the browser.

- Create an app on Fly

  ```sh
  fly apps create autogpt-js
  ```

- Add a `SESSION_SECRET` to your fly app secrets, to do this you can run the following commands:

  ```sh
  fly secrets set SESSION_SECRET=$(openssl rand -hex 32) --app autogpt-js
  ```

  If you don't have openssl installed, you can also use [1Password](https://1password.com/password-generator) to generate a random secret, just replace `$(openssl rand -hex 32)` with the generated secret.

- Create a persistent volume for the sqlite database. Though there is no code reading/writing to sqlite but that dependency from this project starter template was not removed.

  ```sh
  fly volumes create data --size 1 --app autogpt-js
  ```

- Now that everything is set up you can deploy.

  ```sh
  fly deploy --app autogpt-js
  ```

### Docker

1. Run `docker build -t IMAGE_NAME .` to create the docker image
2. Deploy the docker image based on what cloud and infrastructure you are using
3. Start the container based on your infra e.g. `docker run -p PORT:8080 IMAGE_NAME`.

### Direct

1. Run `npm install` to get all dependencies.
2. Run `npm run build` to build the project.
3. Run `NODE_ENV="production" npm run start` to start the server which will expose the endpoint at `localhost:3000`. You can then use a reverse proxy like NGINX to route to that local address on your server.

## Contributing

We welcome and encourage contributions from the developer community.

## License

This project is licensed under the [MIT License](LICENSE). By contributing to this project, you agree to the terms and conditions of the license.
