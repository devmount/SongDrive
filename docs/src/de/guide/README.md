# Guide

## Einleitung

SongDrive ist ein Werkzeug für Musiker, die regelmäßig Auftritte haben und wurde als persönliche Lieder-Datenbank entwickelt, um Lieder passend für verschiedene Anwendungsfälle präsentieren zu können. SongDrive kann u.a. genutzt werden, um:

- ein Lied über die Suche schnell zu finden und spontan spielen zu können
- ein Lied zu transponieren und als PDF zu exportieren
- Setlisten mit minimalem Aufwand zu erstellen, basierend auf Tonart und Tags
- die Lieder einer Setlist zu Präsentieren - für den Musiker wie für das Publikum

### Funktionen

SongDrive bringt viele Funktionen mit, die den Musiker sowohl in der Vorbereitung als auch  während der Aufführung unterstüzten:

- Lieder erstellen, bearbeiten und löschen
- optimierte Vollbildansicht eines Liedes (kein Scrollen)
- Sprache des Liedes umschalten
- Lieder und Setlisten während der Eingabe filtern oder mithilfe von Tags
- Tonarten transponieren
- Setlisten erstellen, bearbeiten und löschen
- Lieder einer Setlist per Drag and Drop neu anordnen
- optimierte Präsentationsansicht einer Setlist
- Lieder, Setlisten und Liedzettel als PDF exportieren
- Text-Export für Lieder, Setlisten und Liedzettel
- Export von Setlisten für Slack und als Markdown

### Todo

SondDrive ist aktuell in Entwicklung. Einige Funktionen sind noch nicht vorhanden, aber in Planung:

- Tastenkürzel <Badge text="todo" type="warn"/>
- Benutzerrollen <Badge text="todo" type="warn"/>
- Verbesserung der Listenanzeige (Sortierung, Seitennavigation, Filter für Tonarten) <Badge text="todo" type="warn"/>
- Mehrsprachigkeit der Benutzeroberfläche <Badge text="todo" type="warn"/>
- Offline Verfügbarkeit (PWA, Service Worker) <Badge text="todo" type="warn"/>

### Mithelfen

Feedback und Mitarbeit sind großartig!

## Erste Schritte

### Installation

1. Dateien herunterladen

    ```bash
    git clone https://github.com/devmount/SongDrive
    ```

2. Alle Abhängigkeiten mit [Yarn](https://yarnpkg.com) installieren

    ```bash
    cd SongDrive
    yarn
    ```

3. Eine leere Datei `config.js` in `SongDrive/src` erstellen

    ```bash
    touch src/config.js
    ```

4. In [Firebase](https://console.firebase.google.com) einloggen, den Button "Add a project" klicken und einen Projektnamen sowie den Serverstandort angeben.
5. Jetzt kann eine App hinzugefügt werden mithilfe des "Web" Buttons: Einen Namen vergeben und auf "Next" klicken
6. Das Firebase Config-Objekt in die angelegte `config.js` wie folgt kopieren:

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

7. Jetzt kann die App gestartet werden. Entweder den Development-Server mit Hot-Reload starten unter `localhost:8080` ...

    ```bash
    yarn serve
    ```

8. ... oder den für die Produktion optimierten Build erstellen:

    ```bash
    yarn build
    ```

::: warning HINWEIS
Der Installationsprozess ist noch in Entwicklung. Ein zusätzlicher Schritt zum Import von Testdaten ist geplant.
:::

### Benutzung

#### Lied-Syntax

The notation of the song content is simple: Just add the song lines with the corresponding chords above the exact syllable. Add two whitespaces at the end of each chord line for them to be recognized by the system for text only view or transposition.
