# SongDrive

[![license](https://img.shields.io/badge/license-MIT%20License-88b544.svg?style=flat-square)](./LICENSE) [![release](https://img.shields.io/badge/release-v1.0.1%20pre-88b544.svg?style=flat-square)](https://github.com/devmount/SongDrive) [![size](https://img.shields.io/badge/size-600%20KB-88b544.svg?style=flat-square)](https://github.com/devmount/SongDrive)

A song management web application to store, synchronize and present songs and setlists, based on [Vue.js](//vuejs.org/), [Firebase](//firebase.google.com/) and [Spectre.css](//github.com/picturepan2/spectre).

![songdrive-dashboard](https://user-images.githubusercontent.com/5441654/49120961-188ea400-f2af-11e8-80d1-05a31fb16cd1.png)

SongDrive 1.x is currently in development, if you are looking for SongDrive 0.x, you can download the latest release [here](https://github.com/devmount/SongDrive/releases).

## Features

- Create, edit and delete songs
- Normal and viewport optimized fullscreen view for a single song
- Switch song languages
- Filter songs and setlists on typing and by tags
- Transpose song tuning
- Create, edit and delete setlists
- Rearrange songs in setlists with simple drag and drop
- Presentation view for setlists
- PDF export for songs, setlists and songsheets
- Plain text export for songs, setlists and songsheets
- Hotkey support

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

4. Log in to your [Firebase account](https://console.firebase.google.com) and hit the "Create new project" button
5. Enter your new project and click "Add Firebase to your web app"
6. Copy the following code from the code that is shown to your just created `config.js`:

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

7. To create the necessary database structure, go to *Database* in the left menu of your Firebase dashboard, click on the three dot menu on the upper right corner of the database field and choose *Import JSON*. In the following file selection dialog, browse for the file `database.json` contained in this repository and import it.

8. Either start the development server with hot reload at localhost:8080 ...

    ```bash
    yarn serve
    ```

9. ... or create a production build with minification

    ```bash
    yarn build
    ```
---

<!--
## Usage

### Song Syntax

The notation of the song content is simple: Just add the song lines with the corresponding chords above the exact syllable. Add two whitespaces at the end of each chord line for them to be recognized by the system for text only view or transposition.
-->

## Licence

[MIT License](./LICENSE)

---

SongDrive is completely free to use. If you enjoy it, please consider [donating via Paypal](https://paypal.me/devmount) for further development. :green_heart:
