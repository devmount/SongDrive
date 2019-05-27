# Guide

## Introduction

SongDrive is a tool for musicians, that perform songs on a regular basis. It was created to provide a self-maintainable song database with a clean presentation of songs for different use cases, i.e.:

- quick search for a song to play spontaneously
- transpose a song and export the song as PDF
- create setlists with minimal effort based on song tuning and tags
- navigate through the songs of a setlist for the artist as well as for the audience

### Features

SongDrive ships with a lot of features supporting artists in preparation of or during a gig:

- create, edit and delete songs
- viewport optimized fullscreen view for a single song
- switch song languages
- filter songs and setlists on typing and by tags
- transpose song tuning
- create, edit and delete setlists
- rearrange songs in setlists with drag and drop
- viewport optimized presentation view for setlists
- PDF export for songs, setlists and songsheets
- plain text export for songs, setlists and songsheets
- setlist export in slack and markdown formatting

### Todo

SongDrive is still a work in progress. There are some things that it currently does not support but are planned:

- hotkeys, shortcuts <Badge text="todo" type="warn"/>
- user roles <Badge text="todo" type="warn"/>
- list enhancements (sortability, pagination, filter for tuning) <Badge text="todo" type="warn"/>
- multi language support <Badge text="todo" type="warn"/>
- offline version (pwa, service worker) <Badge text="todo" type="warn"/>

### Contributions

Feedback and contributions are very welcome!

## Getting started

### Installation

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

8. ... or create an optimized production build with minification

    ```bash
    yarn build
    ```

::: warning HINT
The setup process is still in development. An additional step with the possibility to add test data will be added soon.
:::

### Usage

#### Song Syntax

The notation of the song content is simple: Just add the song lines with the corresponding chords above the exact syllable. Add two whitespaces at the end of each chord line for them to be recognized by the system for text only view or transposition.
