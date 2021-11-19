# SongDrive

[![Release](https://img.shields.io/github/v/tag/devmount/SongDrive.svg?label=release&color=88b544&style=flat-square&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsSAAALEgHS3X78AAAATklEQVQ4jWP8//8/AyWAiSLd1DCABZfEnnsVKH5zUepgpIkLKA5EnF7o3OaKYnK5125GbN4aJF7A5jRsXsAmNki8QKxzB6cXKHMBAwMDAFesMxVwNRpMAAAAAElFTkSuQmCC)](https://github.com/devmount/SongDrive/releases)
[![Last Updated](https://img.shields.io/github/last-commit/devmount/SongDrive?label=updated&color=88b544&style=flat-square)](https://github.com/devmount/SongDrive/commits/main)
[![CodeQL Analysis](https://img.shields.io/github/workflow/status/devmount/SongDrive/CodeQL?label=CodeQL&logo=github&color=88b544&style=flat-square)](https://github.com/devmount/SongDrive/actions/workflows/codeql-analysis.yml)
[![License](https://img.shields.io/badge/license-MIT-88b544.svg?style=flat-square)](./LICENSE)
[![Contribution Guidlines](https://img.shields.io/badge/contributions-welcome-88b544.svg?style=flat-square)](./.github/CONTRIBUTING.md)

A song management web application to store, synchronize and present songs and setlists, based on [Vue.js](//vuejs.org/), [Firebase](//firebase.google.com/) and [Spectre.css](//github.com/picturepan2/spectre). Head over to the docs ([EN](https://github.com/devmount/SongDrive/blob/main/src/docs/docs.en.md), [DE](https://github.com/devmount/SongDrive/blob/main/src/docs/docs.en.md)) for more information how to get started with SongDrive.

> **Note**  
> SongDrive v1.x is currently in beta, if you are looking for SongDrive v0.x, you can download the final release v0.2.10 [here](https://github.com/devmount/SongDrive/releases/tag/v0.2.10).

## Preview

This is how the SongDrive Dashboard currently looks like.

![20211105_songdrive_dashboard](https://user-images.githubusercontent.com/5441654/140494330-9022aa11-7513-4feb-b0e0-4f0f95f5a759.png)

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
- Export and Import of complete SongDrive data

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

3. Create an environment configuration file `.env` from the existing example configuration in the root directory:

    ```bash
    cp .env.example .env
    ```

4. Log in to your [Firebase account](https://console.firebase.google.com), hit the "Add a project" button and set up a project name and a server location
5. Now you can add an app by clicking the "Web" button, choose a nickname and click "Next"
6. Copy *API key* and *project ID* into your `.env` file
7. Go back to your Firebase console, and click *Create Database* under Develop > Database. Choose *Start in production mode* and set the following security rules:

    ```javascript
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "reader"
                      || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "performer"
                      || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "editor";
          allow read, write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
        }
        match /setlists/{setlist} {
          allow create, update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "performer"
                                || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "editor";
          allow delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "editor"
                        || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "performer" && request.auth.uid == resource.data.creator;
        }
        match /songs/{song} {
          allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "editor";
        }
        match /registrations/{user} {
          allow create: if request.auth.uid != '';
        }
        match /users/{user} {
          allow read: if request.auth.uid != '' && user == request.auth.uid;
        }
      }
    }
    ```

8. Create the first user in the Firebase console under Build > Authentification > Add user. After that you'll see the User UID in the table. Copy that UID, navigate to Build > Firestore Database > + Start collection. Input *users* as Collection ID and click Next. Insert the copied UID as Document ID and add the following fields to the document:
    - `email` = string | *your email address*
    - `name` = string | *your name*
    - `role` = string | `admin`

9. Now your app is ready to be launched. Either start the development server with hot reload at `localhost:8080` ...

    ```bash
    yarn serve
    ```

10. ... or create an optimized production build with minification. All build files can be found in the `dist` directory.

    ```bash
    yarn build
    ```

11. (optional) You can import demo content if you don't like to start from scratch. First download the [demo data file](https://raw.githubusercontent.com/devmount/SongDrive/main/demo.import.json) from the repository. Sign in to SongDrive with your admin user, go to Settings > Import, select the downloaded demo file and import it. You can now have a look at 8 public domain songs, one demo setlist, several song tags, English and German languages and an additional test user.

## Licence

[MIT License](./LICENSE)

---

SongDrive is completely free to use. If it's useful for you and you enjoy it, please consider [contributing](./.github/CONTRIBUTING.md) or [donating via Paypal](https://paypal.me/devmount) for further development. 💚
