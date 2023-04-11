# Backpack Documentation

This repository serves as the source for [Backpack](https://www.Backpack.app) documentation. The source files in the repository are used to render the documentation pages at https://www.Backpack.app .

You can contribute to this repository by submitting a Pull Request with your suggested changes. Once merged to the main branch, these changes will be reflected on the site. Read our [contributing document](CONTRIBUTING.md) for more detail.

## Website

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

### Installation

You will need Yarn installed, which in turn requires npm and Node. On a Mac using homebrew, you can run `brew install node`.

Assuming you have npm set up, you can run:

```console
npm install --global yarn
```

Then run

```console
$ yarn
```

### Local Development

```console
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```console
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```console
$ USE_SSH=true yarn deploy
```

Not using SSH:

```console
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

