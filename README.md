# ![SongDrive Logo Title](https://github.com/devmount/SongDrive/assets/5441654/77b68e2d-a877-4855-bece-c067f2219e71)

[![Release](https://img.shields.io/github/v/tag/devmount/SongDrive.svg?label=release&color=88b544&style=flat-square)](https://github.com/devmount/SongDrive/releases)
[![Last Updated](https://img.shields.io/github/last-commit/devmount/SongDrive?label=updated&color=88b544&style=flat-square)](https://github.com/devmount/SongDrive/commits/main)
[![CodeQL Analysis](https://img.shields.io/github/actions/workflow/status/devmount/SongDrive/codeql-analysis.yml?branch=main&label=CodeQL&logo=github&color=88b544&style=flat-square)](https://github.com/devmount/SongDrive/actions/workflows/codeql-analysis.yml)
[![License](https://img.shields.io/badge/license-MIT-88b544.svg?style=flat-square)](./LICENSE)
[![Contribution Guidlines](https://img.shields.io/badge/contributions-welcome-88b544.svg?style=flat-square)](./.github/CONTRIBUTING.md)

A song management web application to store, sync and present songs and setlists, based on [Vue.js](//vuejs.org) and [Firebase](//firebase.google.com). Head over to the docs ([EN](https://github.com/devmount/SongDrive/blob/main/frontend/src/docs/docs.en.md), [DE](https://github.com/devmount/SongDrive/blob/main/frontend/src/docs/docs.en.md)) for more information about SongDrive and how to get started.

> <picture>
> <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Mqxx/GitHub-Markdown/main/blockquotes/badge/light-theme/info.svg">
> <img alt="Info" src="https://raw.githubusercontent.com/Mqxx/GitHub-Markdown/main/blockquotes/badge/dark-theme/info.svg">
> </picture><br>
> SongDrive is currently being restructured to have its own backend with database, authentication and API endpoints for the frontend. Find more information about this in https://github.com/devmount/SongDrive/issues/213.

## Preview

This is how the SongDrive Dashboard currently looks like.

![20230725_songdrive_dashboard](https://github.com/devmount/SongDrive/assets/5441654/94df7e1a-3c65-460e-817d-24c1783e7685)

*A demo page is planned.*

## Features

- Create and edit songtexts with chords using a [simple syntax](https://github.com/devmount/SongDrive/blob/main/frontend/src/docs/docs.en.md#song-syntax)
- Show single songs with a lot of tools or in a viewport optimized fullscreen view
- Maintain song translations and wwitch song languages with a single click
- Live-search through songs and setlists or filter by tags and by key
- Live-transpose song key or save transposed songs on setlists
- Create setlists and rearrange songs with simple drag and drop
- Present setlists for on-stage performance with device synchronization
- Export songssheets and setlists as plain text, PDF, SNG or Slack formatted
- Use Hotkeys for almost anything (hotkey cheatsheet included)
- Analyze general, setlist and user specific stats
- UI supports multiple languages (currently: EN, DE)
- Users can [manage their own profile](https://github.com/devmount/SongDrive/blob/main/frontend/src/docs/docs.en.md#account), change email and password or delete their account.
- Many admin functions including export and Import of complete SongDrive data and managing users with [different roles](https://github.com/devmount/SongDrive/blob/main/frontend/src/docs/docs.en.md#user-roles)

## Code structure

SongDrive is divided into frontend and backend. The goal is to make both parts independent from each other. The restructuring is still work in progress. You can find documentation in the corresponding directory:

- [Frontend docs](./frontend/README.md)
- [Backend docs](./backend/README.md)

## License

This project is licensed under the [MIT License](./LICENSE).

---

SongDrive is completely free to use. If it's useful for you and you enjoy it, please consider [contributing](./.github/CONTRIBUTING.md), [sponsoring me](https://github.com/sponsors/devmount) or [donating via Paypal](https://paypal.me/devmount) to support further development. 💚
