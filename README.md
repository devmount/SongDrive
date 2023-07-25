# ![SongDrive Logo Title](https://user-images.githubusercontent.com/5441654/147848659-8cbc8ac6-d7d8-4c56-a36d-ce904da2bd5a.png)

[![Release](https://img.shields.io/github/v/tag/devmount/SongDrive.svg?label=release&color=88b544&style=flat-square)](https://github.com/devmount/SongDrive/releases)
[![Last Updated](https://img.shields.io/github/last-commit/devmount/SongDrive?label=updated&color=88b544&style=flat-square)](https://github.com/devmount/SongDrive/commits/main)
[![CodeQL Analysis](https://img.shields.io/github/actions/workflow/status/devmount/SongDrive/codeql-analysis.yml?branch=main&label=CodeQL&logo=github&color=88b544&style=flat-square)](https://github.com/devmount/SongDrive/actions/workflows/codeql-analysis.yml)
[![License](https://img.shields.io/badge/license-MIT-88b544.svg?style=flat-square)](./LICENSE)
[![Contribution Guidlines](https://img.shields.io/badge/contributions-welcome-88b544.svg?style=flat-square)](./.github/CONTRIBUTING.md)

A song management web application to store, sync and present songs and setlists, based on [Vue.js](//vuejs.org) and [Firebase](//firebase.google.com). Head over to the docs ([EN](https://github.com/devmount/SongDrive/blob/main/src/docs/docs.en.md), [DE](https://github.com/devmount/SongDrive/blob/main/src/docs/docs.en.md)) for more information about SongDrive and how to get started.

## Preview

This is how the SongDrive Dashboard currently looks like.

![20230725_songdrive_dashboard](https://github.com/devmount/SongDrive/assets/5441654/94df7e1a-3c65-460e-817d-24c1783e7685)

*A demo page is planned.*

## Features

- Create and edit songtexts with chords using a [simple syntax](https://github.com/devmount/SongDrive/blob/main/src/docs/docs.en.md#song-syntax)
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
- Users can [manage their own profile](https://github.com/devmount/SongDrive/blob/main/src/docs/docs.en.md#account), change email and password or delete their account.
- Many admin functions including export and Import of complete SongDrive data and managing users with [different roles](https://github.com/devmount/SongDrive/blob/main/src/docs/docs.en.md#user-roles)

## Installation for developers

1. Get all files from repository

    ```bash
    git clone https://github.com/devmount/SongDrive
    ```

2. Install all dependencies

    ```bash
    cd SongDrive
    npm install
    ```

3. Create an environment configuration file `.env` from the existing example configuration in the root directory:

    ```bash
    cp .env.example .env
    ```

4. Log in to your [Firebase account](https://console.firebase.google.com), hit the "Add a project" button and set up a project name and a server location
5. Now you can add an app by clicking the "Web" button, choose a nickname and click "Next"
6. Copy *API key* and *project ID* into your `.env` file
7. Go back to your Firebase console, and click *Create Database* under Develop > Database. Choose *Start in production mode* and paste the security rules that you can copy frome the [firestore.rules](./firestore.rules) file.
8. Create the first user in the Firebase console under Build > Authentification > Add user. After that you'll see the User UID in the table. Copy that UID, navigate to Build > Firestore Database > + Start collection. Input *users* as Collection ID and click Next. Insert the copied UID as Document ID and add the following fields to the document:
    - `email` = string | *your email address*
    - `name` = string | *your name*

9. To give necessary permisstions, click + Start collection again. Input *permissions* as Collection ID and click Next. Insert the copied UID as Document ID and add the following field to the document:
    - `role` = string | `admin`

10. Now your app is ready to be launched. Either start the development server with hot reload at `localhost:8080` ...

    ```bash
    npm run serve
    ```

11. ... or create an optimized production build with minification. All build files can be found in the `dist` directory.

    ```bash
    npm run build
    ```

12. (optional) You can import demo content if you don't like to start from scratch. First download the [demo data file](https://raw.githubusercontent.com/devmount/SongDrive/main/demo.import.json) from the repository. Sign in to SongDrive with your admin user, go to Settings > Import, select the downloaded demo file and import it. You can now have a look at 8 public domain songs, one demo setlist, several song tags, English and German languages and an additional test user.

## License

This project is licensed under the [MIT License](./LICENSE).

---

SongDrive is completely free to use. If it's useful for you and you enjoy it, please consider [contributing](./.github/CONTRIBUTING.md) or [donating via Paypal](https://paypal.me/devmount) to support further development. 💚
