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
- light mode <Badge text="todo" type="warn"/>
- list enhancements (pagination) <Badge text="todo" type="warn"/>
- multi language support <Badge text="todo" type="warn"/>
- offline version (pwa, service worker) <Badge text="todo" type="warn"/>
- maintain Youtube links to listen to the songs <Badge text="todo" type="warn"/>
- present note slides in setlist presentations <Badge text="todo" type="warn"/>
- tag based song suggestions <Badge text="todo" type="warn"/>

### Contributions

Feedback and contributions are very welcome! You can help by reporting bugs, suggesting improvements or directly contribute to the code base or the documentation. You'll find a detailed explanation in the [contribution guidelines on GitHub](https://github.com/devmount/SongDrive/blob/master/.github/CONTRIBUTING.md).

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

::: warning HINT
The setup process is still in development. An additional step with the possibility to add test data will be added soon.
:::

## User roles

SongDrive has a user role and rights administraion. The following roles are implemented:

- **A**dministrator
- **E**ditor
- **P**erformer
- **R**eader

These roles have the following privileges:

- **`R P E A`**
- `X X X X` see dashboard, song list and setlist list
- `X X X X` open single songs (present, tune, export)
- `X X X X` open single setlists (present, copy, export)
- `- X X X` create and edit setlists
- `- X X X` custom tuning in setlists
- `- X X X` sync setlists
- `- - X X` create and edit songs
- `- - X X` delete songs and setlists
- `- - - X` create, edit and delete tags
- `- - - X` create, edit and delete users

## Usage

SongDrive provides a main menu on the left to navigate to all overview pages (dashboard, lists of all songs and setlists and account).

### Dashboard

The dashboard is the entry point for SongDrive, which gives important information at first glance:

- latest added songs and setlists
- popular songs (based on number of setlists containing this song)
- number of setlists and performed songs per year

It also provides handy tools like the random song and information about SongDrive itself (numbers of songs, setlists, languages and users or SongDrive version).

### Songs

*Songs* provides a list of all songs already added to SongDrive in tabular form. On top of the table you find the possiblity to filter the song list by search query (currently the search is performed on titles and subtitles, not on song content) or tag.

If you click on of the rows, the song and a secondary menu is shown on the left, providing the following features (you can also use the *Action* menu on the right to acces some of the features):

- *edit*: opens the edit dialog to change the song data
- *clone*: opens the edit dialog with the current song data, but adds it as new song on save
- *delete*: deletes the current song. At the moment, this cannot be undone.
- *lannguage*: lists all languages, where a translation of the current song exists (each language is a song on its own, that can be combined in the edit dialog)
- *chords*: you can toggle chords here. This also effects other actions like presentation view or exports
- *present*: opens the song in presentation view, which is viewport optimized (maximized font size)
- *tuning*: Here you can change the tuning of the song up and down, or you can reset to the original tuning
- *.TXT*: exports the song in plain text format
- *.SNG*: exports the song in SongBeamer format, also readable by OpenLP
- *.PDF*: exports the song as PDF and opens it in the browser

#### Song Syntax

To add or edit a song, you have to provide the song text and the chords in a special (but easy) notation format.

The notation of song content and chords follows a simple rule: What you type is what you get. Just add the song lines with the corresponding chords above the exact syllable. Add two whitespaces at the end of each chord line for them to be recognized by the system as chord lines for text only view or transposition.

::: tip
Try to provide a chord line for each line of text (don't skip chord lines for parts with the same chords, i.e. the second verse), as the goal is to make it as easy as possible for the song performer to play the song.
:::

In addition to songtext and chords, you can label the different song parts using markers. A marker starts with two dashes, followed by a letter indicating the song part (i.e. *c* for *chorus*). The following table shows all possible markers:

| Marker | Description |
| ------ | ----------- |
| `--v`  | verse       |
| `--p`  | pre-chorus  |
| `--c`  | chorus      |
| `--b`  | bridge      |
| `--i`  | intro       |
| `--m`  | mitro       |
| `--o`  | outro       |

You can add a number to each song part to enumerate them, i.e. `--v1` and `--v2` for two different verses. Currently the numbers are only displayed for verses but can be used for every other song part too.

Here is an example with three different song parts:

```plain
--v
  G          C  
This is the verse text
 D        G  
Just an example text

--c
  D           C  
This is the chorus text
 D        C      G  
Just an example text

--b
  Em  
This is the bridge text
 C        D  
Just an example text
```

And here comes a real world example:

```plain
--v1
  G       G7        C        G  
Amazing grace how sweet the sound
               G7         D D7  
That saved a wretch like me
  G         G7       C      G  
I once was lost but now am found
      Em       D     G  
Was blind but now I see

--v2
        G         G7        C        G  
'Twas grace that taught my heart to fear
              G7      D    D7  
And grace my fears relieved
      G       G7        C      G  
How precious did that grace appear
     Em     D       G  
The hour I first believed

--v3
...
```

And that's it - having this simple song syntax in mind you are now ready to add your own songs to SongDrive.

### Setlists

*Setlists* provides a list of all setlists already added to SongDrive in tabular form. On top of the table you find the possiblity to filter the setlist list by search query (the search is performed on setlist titles) or year.

If you click on of the rows, the setlist and a secondary menu is shown on the left, providing the following features (you can also use the *Action* menu on the right to acces some of the features):

- *edit*: opens the edit dialog to change the setlist data
- *clone*: opens the edit dialog with the current setlist data, but adds it as new setlist on save
- *delete*: deletes the current setlist. At the moment, this cannot be undone.
- *sync*: enables presentation synchronization. If active, the presentation view on other browsers or devices can be synchronized with the current presentation (automatic song switching)
- *present*: opens the setlist in presentation view, which is viewport optimized (maximized font size)
- *plain*: exports the setlist list in plain text format
- *markdown*: exports the setlist list in [Markdown](https://daringfireball.net/projects/markdown/)
- *slack*: exports the setlist lis formatted for [Slack](https://get.slack.help/hc/en-us/articles/202288908-Format-your-messages)
- *list*: exports setlist list as PDF
- *sheets*: exports all songs contained in this setlist as single PDF (one song per page)

<!--
### Account

#### Profile

#### Settings

#### Logout
-->
