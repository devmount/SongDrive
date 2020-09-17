# SongDrive

[![release](https://img.shields.io/npm/v/songdrive/latest.svg?label=release&color=88b544&style=flat-square&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsSAAALEgHS3X78AAAATklEQVQ4jWP8//8/AyWAiSLd1DCABZfEnnsVKH5zUepgpIkLKA5EnF7o3OaKYnK5125GbN4aJF7A5jRsXsAmNki8QKxzB6cXKHMBAwMDAFesMxVwNRpMAAAAAElFTkSuQmCC)](https://github.com/devmount/SongDrive/releases) [![downloads](https://img.shields.io/npm/dt/songdrive?label=downloads&color=88b544&style=flat-square)](https://www.npmjs.com/package/songdrive) [![last commit](https://img.shields.io/github/last-commit/devmount/SongDrive?label=updated&color=88b544&style=flat-square)](https://github.com/devmount/SongDrive/commits/master) [![license](https://img.shields.io/badge/license-MIT-88b544.svg?style=flat-square)](./LICENSE) [![contributions welcome](https://img.shields.io/badge/contributions-welcome-88b544.svg?style=flat-square)](./.github/CONTRIBUTING.md)

A song management web application to store, synchronize and present songs and setlists, based on [Vue.js](//vuejs.org/), [Firebase](//firebase.google.com/) and [Spectre.css](//github.com/picturepan2/spectre). Head over to [the docs](https://devmount.github.io/SongDrive) for more information.

> SongDrive v1.x is currently in beta, if you are looking for SongDrive v0.x, you can download the final release v0.2.10 [here](https://github.com/devmount/SongDrive/releases/tag/v0.2.10).

## Preview

This is how the SongDrive Dashboard currently looks like.

![20200223_songdrive_dashboard](https://user-images.githubusercontent.com/5441654/77798970-235c7300-7074-11ea-9485-576584d19273.png)

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
- Hotkey support
- General statistics, setlist and user specific stats
- UI supports multiple languages (currently: EN, DE)

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

7. Go back to your Firebase console, and click *Create Database* under Develop > Database. Choose *Start in production mode* and set the following security rules:

    ```javascript
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read;
          allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
        }
        match /setlists/{setlist} {
          allow create, update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "performer"
                                || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "editor";
          allow delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "editor"
                        || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "performer" && request.auth.uid == resource.data.creator;
        }
        match /songs/{song} {
          allow create, update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "editor";
          allow delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "editor";
        }
        match /registrations/{user} {
          allow create: if request.auth.uid != '';
        }
      }
    }
    ```

8. Now your app is ready to be launched. Either start the development server with hot reload at `localhost:8080` ...

    ```bash
    yarn serve
    ```

9. ... or create an optimized production build with minification. All build files can be found in the `dist` directory.

    ```bash
    yarn build
    ```

::: warning HINT
The setup process is still in development. An additional step with the possibility to add test data will be added in a future release.
:::

## Licence

[MIT License](./LICENSE)

---

SongDrive is completely free to use. If it's useful for you and you enjoy it, please consider [contributing](.github/CONTRIBUTING.md) or [donating via Paypal](https://paypal.me/devmount) for further development. :green_heart:
