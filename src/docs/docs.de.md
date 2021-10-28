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
- Listen von Liedern und Setlisten per Suchbegriff beim Tippen filtern oder mithilfe von Tags oder Tonart
- Tonarten transponieren und und per Setlist speichern
- Setlisten erstellen, bearbeiten und löschen
- Lieder einer Setlist per Drag and Drop neu anordnen
- optimierte Präsentationsansicht einer Setlist
- Lieder, Setlisten und Liedzettel als PDF exportieren
- Text-Export für Lieder, Setlisten und Liedzettel
- Export von Setlisten für Slack und als Markdown
- Unterstützung von Tastenkürzeln
- Mehrsprachigkeit der Benutzeroberfläche
- Pflege von Youtube Links zum direkten Anhören der Lieder

### Todo

SongDrive ist aktuell in Entwicklung. Einige Funktionen sind noch nicht vorhanden, aber in Planung:

- Light Mode <Badge text="todo" type="warn"/>
- Offline Verfügbarkeit (PWA, Service Worker) <Badge text="todo" type="warn"/>
- Präsentation von Notizfolien in Setlisten <Badge text="todo" type="warn"/>
- Tagbasierte Vorschläge ähnlicher Lieder <Badge text="todo" type="warn"/>

### Mithelfen

Feedback und Mitarbeit sind großartig! Du kannst helfen indem du Fehler meldest, Verbesserungen vorschlägst oder direkt zum Quellcode oder der Dokumentation beiträgst. Genauere Anweisungen dazu findest du in den [Contribution Guidelines auf GitHub](https://github.com/devmount/SongDrive/blob/master/.github/CONTRIBUTING.md).

## Installation

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

7. In der Firebase Konsole *Create Database* unter Develop > Database klicken. *Start in production mode* wählen und die folgenden Sicherheitsregeln hinterlegen:

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

8. Jetzt kann die App gestartet werden. Entweder den Development-Server mit Hot-Reload starten unter `localhost:8080` ...

    ```bash
    yarn serve
    ```

9. ... oder den für die Produktion optimierten Build erstellen. Alle erzeugten Dateien können anschließend im `dist` Ordner gefunden werden.

    ```bash
    yarn build
    ```

::: warning HINWEIS
Der Installationsprozess ist noch in Entwicklung. Ein zusätzlicher Schritt zum Import von Testdaten ist geplant.
:::

## Benutzerrollen

SongDrive verfügt über ein Rollen- und Rechtesystem. Folgende Benutzerrollen sind implementiert:

- **A**dministrator
- **E**ditor
- **P**erformer
- **B**eobachter

Folgende Rechte sind für die verschiedenen Rollen vergeben:

- **`B P E A`**
- `X X X X` Dashboard, Liederliste and Setlist-Liste einsehen
- `X X X X` Einzelne Lieder öffnen (präsentieren, Tonart ändern, exportieren)
- `X X X X` Einzelne Setlisten öffnen (präsentieren, Inhalte kopieren, exportieren)
- `- X X X` Setlisten erstellen und bearbeiten
- `- X X X` Setlist-spezifische Tonarten speichern
- `- X X X` Setlisten synchronisieren
- `- - X X` Lieder erstellen und bearbeiten
- `- - X X` Lieder und Setlisten löschen
- `- - - X` Tags erstellen, bearbeiten und löschen
- `- - - X` Benutzer erstellen, bearbeiten und löschen

## Nutzung

Die linke Seitenspalte in SongDrive enthält das Hauptmenü, welches die Navigation zu den Übersichtsseiten (Dashboard, Songübersicht, Setlistübersicht und Konto) erlaubt.

### Dashboard

Das Dashboard ist der Einstiegspunkt für SongDrive, das wichtige Informationen auf den ersten Blick liefert:

- zuletzt hinzugefügte Songs und Setlisten
- Beliebte Songs (basierend auf der Anzahl der Setlisten, die diesen Song enthalten)
- Anzahl der Setlisten und entsprechend genutzten Songs pro Jahr

Es bietet auch praktische Tools wie die Anzeige eines zufälligen Songs und Informationen über SongDrive selbst (Anzahl der Songs, Setlisten, Sprachen und Benutzer oder SongDrive-Version).

### Songs

*Songs* bietet eine Liste aller bereits in SongDrive hinzugefügten Songs in tabellarischer Form. Über der Tabelle befindet sich die Möglichkeit, die Songliste nach einem Suchbegriff (derzeit wird die Suche nach Titeln und Untertiteln, nicht nach Songinhalten durchgeführt) oder Tag zu filtern.

Durch Klick auf eine Zeile, wird der Song angezeigt mit einem zusätzlichen Menü, welches die folgenden Funktionen bereitstellt (es kann auch das Menü *Aktion* auf der rechten Seite von jeder Tabellenzeile verwendet werden, um auf einige der Funktionen zuzugreifen):

- *bearbeiten*: öffnet den Bearbeitungsdialog, um die Songdaten zu ändern.
- *klonen*: öffnet den Bearbeitungsdialog mit den aktuellen Songdaten, legt aber beim Speichern einen neuen Song an.
- *Löschen*: löscht den aktuellen Song. Dies kann im Moment nicht rückgängig gemacht werden.
- *Sprache*: listet alle Sprachen auf, für die eine Übersetzung des aktuellen Songs existiert (jede Sprache ist ein eigener Song in SongDrive, der im Bearbeitungsdialog als Übersetzung konfiguriert werden kann).
- *Akkorde*: Umschalter zwischen Anzeigen und Ausblenden der Akkorde. Dies wirkt sich auch auf andere Aktionen wie Präsentationsansicht oder Exporte aus.
- *präsentieren*: öffnet den Song in der Präsentationsansicht, welche für den Ausgabebildschirm optimiert ist (maximierte Schriftgröße).
- *Tonart*: Hier kann die Tonart des Songs geändert werden, oder  auf die ursprüngliche Stimmung zurückgesetzt werden.
- *.TXT*: exportiert den Song im Klartextformat.
- *.SNG*: exportiert den Song für SongBeamer und OpenLP
- *.PDF*: exportiert den Song als PDF und öffnet ihn im Browser.

#### Songtext Format

Um einen Song hinzuzufügen oder zu bearbeiten, muss der Songtext mit Akkorden in einem speziellen (aber einfachen) Format angeben werden.

Die Notation von Songtext und Akkorden folgt einer einfachen Regel: Es wird das ausgegeben, was auch eingegeben wurde. Es werden einfach die Liedzeilen mit den entsprechenden Akkorden über der genauen Silbe hinzugefügt. Jeder Akkordzeile werden am Zeilenende zwei Leerzeichen hinzugefügt, damit sie vom System für die Textansicht oder Transposition erkannt werden.

::: tip Tipp
Wenn möglich sollte für jede Textzeile auch eine Akkordzeile angegeben werden (Akkorde sollten auch dann gesetzt werden, wenn es bereits einen Liedabschnitt mit diesen Akkorden gibt, z.B. die zweite Strophe), da das Ziel darin besteht, es dem Musiker so einfach wie möglich zu machen, den Song zu spielen.
:::

Neben Songtext und Akkorden können die verschiedenen Songteile mit Markern versehen werden. Ein Marker beginnt mit zwei Gedankenstrichen, gefolgt von einem Buchstaben, der den Songteil identifiziert (z.B. *c* für *Chorus* = Refrain). Die folgende Tabelle zeigt alle möglichen Marker:

| Marker | Description   |
| ------ | ------------- |
| `--v`  | Strophe (engl.: *verse*)  |
| `--p`  | Pre-Chorus    |
| `--c`  | Refrain (engl.: *chorus*) |
| `--b`  | Bridge        |
| `--i`  | Intro         |
| `--m`  | Zwischenspiel |
| `--o`  | Outro         |

Jedem Songabschnitt kann eine Nummer hinzugefügt werden, z.B. `--v1` und `--v2` für zwei verschiedene Strophen. Derzeit werden die Zahlen nur für Strophen angezeigt, können aber für jeden anderen Songabschnitt auch verwendet werden.

Hier ist ein Beispiel mit drei verschiedenen Songabschnitten:

```plain
--v
 G             C  
Das ist die Strophe
D            G  
Einfach ein Beispieltext

--c
D            C  
Das ist der Refrain
D            C      G  
Einfach ein Beisieltext

--b
 Em  
Das ist die Bridge
C            D  
Einfach ein Beispieltext
```

Und hier das Beispiel eines echten Songs:

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

Und das war's auch schon - mit diesem einfachen Format können nun Lieder in SongDrive hinzugefügt werden.

### Setlisten

*Setlisten* stellt eine Liste aller bereits zu SongDrive hinzugefügten Setlisten in tabellarischer Form zur Verfügung. Über der Tabelle befindet sich die Möglichkeit, die Liste von Setlisten nach einem Suchbegriff (die Suche wird nach Titeln durchgeführt) oder Jahr zu filtern.

Durch Klick auf eine Zeile, wird die Setlist angezeigt mit einem zusätzlichen Menü, welches die folgenden Funktionen bereitstellt (es kann auch das Menü *Aktion* auf der rechten Seite von jeder Tabellenzeile verwendet werden, um auf einige der Funktionen zuzugreifen):

- *bearbeiten*: öffnet den Bearbeitungsdialog, um die Setlistendaten zu ändern.
- *klonen*: öffnet den Bearbeitungsdialog mit den aktuellen Setlistendaten, fügt sie aber beim Speichern als neue Setlist hinzu.
- *Löschen*: löscht die aktuelle Setlist. Dies kann im Moment nicht rückgängig gemacht werden.
- *sync*: ermöglicht die Synchronisation der Präsentation. Wenn aktiv, kann die Präsentationsansicht auf anderen Browsern oder Geräten mit der aktuellen Präsentation synchronisiert werden (automatischer Liedwechsel).
- *präsentieren**: öffnet die Setlist in der Präsentationsansicht, welche für den Ausgabebildschirm optimiert ist (maximierte Schriftgröße).
- *plain*: exportiert die Setlist im Klartextformat.
- Markdown*: exportiert die Setlist in [Markdown](https://daringfireball.net/projects/markdown/)
- *slack*: exportiert die Setlist für [Slack](https://get.slack.help/hc/en-us/articles/202288908-Format-your-messages)
- *list*: exportiert die Setlist Liederliste als PDF-Datei
- *Sheets*: exportiert alle in dieser Setlist enthaltenen Songs als einzelnes PDF (ein Song pro Seite).

<!--
### Konto

#### Profil

#### Einstellungen

#### Login und Logout

### Info

#### Tastenkürzel

#### Dokumentation

#### GitHub

-->
