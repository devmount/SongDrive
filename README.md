# SongDrive

[![pre-release](https://img.shields.io/badge/release-v1.1.2-88b544.svg?style=flat-square)](https://github.com/devmount/SongDrive) [![license](https://img.shields.io/badge/license-MIT-88b544.svg?style=flat-square)](./LICENSE) [![contributions welcome](https://img.shields.io/badge/PRs-welcome-88b544.svg?style=flat-square)](./.github/CONTRIBUTING.md)

A song management web application to store, synchronize and present songs and setlists, based on [Vue.js](//vuejs.org/), [Firebase](//firebase.google.com/) and [Spectre.css](//github.com/picturepan2/spectre). Head over to [the docs](https://devmount.github.io/SongDrive) for more information.

> SongDrive v1.x is currently in beta, if you are looking for SongDrive v0.x, you can download the final release v0.2.10 [here](https://github.com/devmount/SongDrive/releases/tag/v0.2.10).

## Preview

This is how the SongDrive Dashboard currently looks like.

![20200223_songdrive_dashboard](https://user-images.githubusercontent.com/5441654/75110387-f90b3600-562d-11ea-9dcd-9acd4fd901ff.png)

*A demo page is planned.*

## Features

- Create, edit and delete songs
- Normal and viewport optimized fullscreen view for a single song
- Switch song languages
- Filter songs and setlists on typing, by tags and by key
- Transpose song key
- Create, edit and delete setlists
- Rearrange songs in setlists with simple drag and drop
- Presentation mode for setlists with device synchronization
- PDF export for songs, setlists and songsheets
- Plain text, SNG and Slack formatted export for songs and setlists
- *Hotkey support* (planned)

## Installation

1. Get all files

    ```bash
    git clone https://github.com/devmount/SongDrive
    ```

2. Install all dependencies using [Yarn](https://yarnpkg.com)

    ```bash
    cd SongDrive
    yarn
    ```

3. Create an empty file called `config.js` in `SongDrive/src`

    ```bash
    touch src/config.js
    ```

4. Log in to your [Firebase account](https://console.firebase.google.com), hit the "Add a project" button and set up a project name and a server location
5. Now you can add an app by clicking the "Web" button, choose a nickname and click "Next"
6. Copy the firebase configuration object from the code that is shown to your just created `config.js` in the following format:

    ```javascript
    export const config = {
        apiKey: "<your-api-key>",
        authDomain: "<your-auth-domain>",
        databaseURL: "<your-database-url>",
        projectId: "<your-project-id>",
        storageBucket: "<your-storage-bucket>",
        messagingSenderId: "<your-messaging-sender-id>"
    }
    ```

7. Now your app is ready to be launched. Either start the development server with hot reload at `localhost:8080` ...

    ```bash
    yarn serve
    ```

8. ... or create an optimized production build with minification. All build files can be found in the `dist` directory.

    ```bash
    yarn build
    ```

> **HINT**
>
> The setup process is still in development. An additional step with the possibility to import test data will be added soon.

## Licence

[MIT License](./LICENSE)

---

SongDrive is completely free to use. If it's useful for you and you enjoy it, please consider [contributing](.github/CONTRIBUTING.md) or [donating via Paypal](https://paypal.me/devmount) for further development. :green_heart:
