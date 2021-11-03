## Introduction

SongDrive is a tool for musicians performing songs on a regular basis. It was created to build a self-maintainable song database with a clean presentation of songs for different use cases, e.g.:

- quickly searching for songs to play spontaneously
- transposing songs and export songsheets as PDF
- creating setlists with minimal effort and provide custom tuning for songs
- presenting setlists in different modes for the artist as well as for the audience

### Features

SongDrive ships with a lot of features supporting artists in preparation of or during a gig:

- create, edit and delete songs and setlists
- viewport optimized fullscreen view for a single song  (no scrolling required, but at least a 10 inch screen recommended)
- switch song language if the song is available in multiple languages
- realtime fulltext search for songs and setlists and filter lists by tags, tuning or language
- transpose song tuning and save custom song tuning per setlist
- rearrange songs in setlists with drag and drop
- viewport optimized presentation view for setlists
- export songs, setlists and songsheets as PDF and other formats
- keyboard shortcuts for navigation and action buttons

SongDrive is still in development, there are more features to come. Check out what's planned in the [public repository on GitHub](https://github.com/devmount/SongDrive/issues?q=is%3Aissue+is%3Aopen+label%3Afeature).

### Contributions

Feedback and contributions are very welcome! You can help by reporting bugs, suggesting improvements or directly contribute to the code base or this documentation. You'll details in the [contribution guidelines on GitHub](https://github.com/devmount/SongDrive/blob/main/.github/CONTRIBUTING.md).

## Get started

If you want to use an existing SongDrive installation, you first need register a new user account. You can use the *Sign Up* Button and provide a name, email address and a password. As soon as an administrator approves your registration and assigns a user role to your account, you can sign in and start using SongDrive according to the privileges of your role.

### Requirements

To use SongDrive, the following requirements should be met:

- Modern browser (SongDrive works best in Firefox, Opera and Chrome)
- Internet connection when starting SongDrive
- Device with a screen of at least 10" and FHD resolution (recommended)

SongDrive is fully responsive and will work on smaller screens too, but some features (like the presentation mode) are especially designed for showing the full song to avoid the need for scrolling while performing the song.

### Installation

SongDrive is Open Source software and totally meant to be self-deployed. If you like to use SongDrive on your own server, please refer to the installation instructions in the [README](https://github.com/devmount/SongDrive/blob/main/README.md).

## User roles

SongDrive has a user role and rights administraion. The following roles are implemented:

- **A**dministrator
- **E**ditor
- **P**erformer
- **R**eader

These roles have the following privileges:

| A | E | P | R |                                             |
|---|---|---|---|---------------------------------------------|
| x | x | x | x | see dashboard, song list and setlist list   |
| x | x | x | x | see single songs (present, tune, export)    |
| x | x | x | x | see single setlists (present, copy, export) |
| x | x | x |   | create and edit setlists                    |
| x | x | x |   | custom song tuning in setlists              |
| x | x | x |   | synchronize setlists                        |
| x | x |   |   | create and edit songs                       |
| x | x |   |   | delete songs and setlists                   |
| x |   |   |   | create, edit and delete song tags           |
| x |   |   |   | create, edit and delete song languages      |
| x |   |   |   | create, edit and delete users               |

## Usage

SongDrive provides a main menu on the left to navigate to all main pages like the dashboard, the overview of all songs and setlists, profile and settings pages as well as the overview of shortcuts and this documentation.

### Dashboard

The [Dashboard](/) is the landing page, which gives important information of SongDrive at first glancein different widgets, e.g.:

- featured numbers about available and performed songs, setlists and song languages
- recently scheduled setlists
- most popular songs (based on number of setlists containing this song) in general and per year

It also provides useful tools like shuffling the song list and charts about the number of songs performed per year or the number of setlists performed per day of week.

### Songs

The [Songs](/songs) menu item provides a list of all songs available in SongDrive. A list navigation is available on top as well as the possibility to sort the list by clicking on the column headers. It can alsow be filtered in realtime by search query (fulltext search), tag, key or song language.

Clicking on a song opens a preview which shows lyrics, chords and a secondary menu on the left, providing the following features:

- *Edit*: Opens the edit dialog to update the song data.
- *Clone*: Opens the new song dialog and prefills it with the current song data.
- *Delete*: Deletes the current song. Currently this cannot be undone.
- *Lannguage*: Shows buttons for all languages, where a translation of the current song exists. Each language is separate song, that can be assigned to each other in the edit dialog.
- *Chords*: Hide and show chords. If chords are shown, the song is set in a monospaced font to properly align chords and lyrics. If chords are hidden, the lyrics are shown in a larger sans-serif font. This option effects the presentation view and exports.
- *Present*: Opens the song in presentation mode, which is viewport optimized. It maximizes the font size while still showing the whole song to prevent the need for scrolling while playing the song.
- *Key*: Transpose the song up and down or reset to the original key
- *.TXT*: Export the song in plain text format
- *.SNG*: Export the song in SongBeamer format, also readable by OpenLP
- *.PDF*: Export the song as PDF song sheet

#### Song Syntax

If you have the *editor* role at least, you can add new songs with the corresponding button (+) at the *Songs* menu item. To add or edit a song, you have to provide the song text and the chords in SongDrive's simple song syntax format.

The notation of song content and chords follows this simple rule: What you type is what you get. Just add the **lyric lines with the corresponding chords above the exact syllable**. An exact alignment is possible as SongDrive uses a monospaced font to show lyrics and chords. Add **two whitespaces** at the end of each chord line for them to be correctly recognized by the system as chord lines.

In addition to lyrics and chords, you can label the different song parts using markers. A marker starts with **two dashes followed by a letter**, indicating the song part (i.e. *c* for *chorus*). The following table shows all possible markers:

| Marker | Description |
| ------ | ----------- |
| `--v`  | verse       |
| `--p`  | pre-chorus  |
| `--c`  | chorus      |
| `--b`  | bridge      |
| `--i`  | intro       |
| `--m`  | mitro       |
| `--o`  | outro       |

You can add a number to each song part to enumerate them, i.e. `--v1` and `--v2` for two different verses. The numbers are only shown for verses but can be applied to every other song part marker too. Markers should always be preceded by a line break.

Example with three different song parts:

```songdrive
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

Real world example with two verses:

```songdrive
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
```

> **TIP**  
> Try to provide a chord line for each line of text (don't skip chord lines for parts with the same chords, i.e. the second verse), as the goal is to make it as easy as possible for the song performer to play the song.

And that's it - having this simple song syntax in mind you are now ready to add your own songs to SongDrive.

### Setlists

The [Setlists](/setlists) menu item provides a list of all setlists available in SongDrive. A list navigation is available on top as well as the possibility to sort the list by clicking on the column headers. It can also be filtered in realtime by search query (setlist titles) or year.

Clicking on a setlist opens a preview which shows the actual list of songs and a secondary menu on the left, providing the following features:

- *Edit*: Opens the edit dialog to update the setlist data.
- *Clone*: Opens the new setlist dialog and prefills it with the current setlist data.
- *Delete*: Deletes the current setlist. Currently this cannot be undone.
- *Sync*: Enables presentation synchronization. If active, the presentation view on other browser tabs on this or other devices can be synchronized with the current presentation (automatic song navigation).
- *Present*: Opens the setlist in presentation mode, which is viewport optimized. It maximizes the font size while still showing one whole song at a time to prevent the need for scrolling while playing the song.
- *Plain*: Export the list in plain text format.
- *Markdown*: Export the list in [Markdown](https://daringfireball.net/projects/markdown/).
- *Slack*: Export the list formatted for [Slack](https://get.slack.help/hc/en-us/articles/202288908-Format-your-messages).
- *List*: Export the list as PDF.
- *Sheets*: Export the songsheets, all songs contained in this setlist as single PDF.

### Account

To protect the data in SongDrive, users have to authentificate themselves to access songs, setlists and more. The main menu on the left provides a *Sign Up* button to register a user account. As soon as an administrator approves the registration, you can use the *Sign In* form in the main menu.

#### Profile

When signed in, you have access to you profile information. It can be found by clicking [on your name](/profile) in the main menu. Your name, role email and profile picture are visible, as well as some numbers about how many setlists you created and how many songs you have performed (the sum of all songs on your setlists).

#### Settings

To update your profile information, visit the [Settings page](/settings). Your name and a link to a profile picture can be set. You can also choose the language of the SongDrive interface.

If you are an administrator, you will have access to additional tools for user management, song language management, song tag managmenet and export or import of SongDrive data.

### Info

The info section in the main menu provides useful general information. The [Shortcuts page](/shortcuts) shows available hotkeys on different view in SongDrive, e.g. for navigation, search or several actions. The [Documentation page](/documentation) gives a detailed overview of SongDrive, its usage and its functions. It also provides the link to the official [GitHub repository](https://github.com/devmount/SongDrive), where SongDrive can be downloaded and contributed to.
