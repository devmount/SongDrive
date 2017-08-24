# SongDrive
[![license](https://img.shields.io/badge/license-MIT%20License-88b544.svg?style=flat-square)](./LICENSE) [![release](https://img.shields.io/badge/release-v0.1.306%20beta-88b544.svg?style=flat-square)](https://github.com/devmount/SongDrive) [![size](https://img.shields.io/badge/size-808%20KB-88b544.svg?style=flat-square)](https://github.com/devmount/SongDrive)

A song management web application to store, synchronize and present songs and setlists, based on [Vue.js 2.3](//vuejs.org/), [Firebase 4.0](//firebase.google.com/) and [Foundation 6.3](//foundation.zurb.com).

![songdrive-dashboard](https://cloud.githubusercontent.com/assets/5441654/26552994/eb423310-4489-11e7-9566-b0b2c421df7c.png)

## Features
- Create, edit and delete songs
- Normal and viewport optimized fullscreen view for a song
- Switch song languages
- Filter songs and setlists on typing
- Transpose song tuning
- Create, edit and delete setlists
- Rearrange songs in setlists with simple drag and drop
- Presentation view for setlists
- PDF export for songs, setlists and songsheets

## Installation

1. Download this repository and unzip it to the location of your choice

    ```
    $ wget https://github.com/devmount/SongDrive/archive/master.zip
    $ unzip master.zip
    $ mv SongDrive-master/ SongDrive/
    ```
    
2. Install all dependencies using [Yarn](https://yarnpkg.com)

    ```
    $ cd SongDrive/
    $ yarn
    ```

2. Create an empty file called `config.js` in the `SongDrive/src` subdirectory
3. Log in to your Firebase account and hit the "Create new project" button
4. Enter your new project and click "Add Firebase to your web app"
5. Copy the following code from the code that is shown to your just created `config.js`:

    ```
    var config = {
        apiKey: "<your-api-key>",
        authDomain: "<your-auth-domain>",
        databaseURL: "<your-database-url>",
        projectId: "<your-project-id>",
        storageBucket: "<your-storage-bucket>",
        messagingSenderId: "<your-messaging-sender-id>"
    }
    ```

6. Now you can open and use SongDrive in your browser by calling the url of the location where you downloaded the project files to, i.e. `example.com/songdrive/` or `file:///your-path/SongDrive/index.html`

## Licence
[MIT License](./LICENSE)
