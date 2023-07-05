## Einleitung

SongDrive ist ein Werkzeug für Musiker, die regelmäßig Songs aufführen. Es wurde entwickelt, um die Möglichkeit zu haben, selbst eine Songdatenbank aufzubauen - mit einer übersichtlichen Darstellung von Songs für verschiedene Anwendungsfälle, z.B:

- schnelles Finden von Songs zum spontanen Spielen
- Transponieren von Songs und Exportieren von Liedblättern als PDF
- Erstellen von Setlisten mit minimalem Aufwand und anpassbaren Tonarten der Songs
- Präsentation von Setlisten in verschiedenen Modi sowohl für den Künstler als auch für das Publikum

### Funktionen

SongDrive verfügt über eine Vielzahl von Funktionen, die den Künstler bei der Vorbereitung und während des Auftritts unterstützen:

- Erstellen, Bearbeiten und Löschen von Songs und Setlisten
- Viewport-optimierte Vollbildansicht für einen einzelnen Song (kein Scrollen erforderlich, aber mindestens ein 10-Zoll-Bildschirm empfohlen)
- Umschalten der Songsprache, wenn der Song in mehreren Sprachen verfügbar ist
- Echtzeit-Volltextsuche für Songs und Setlisten und Filterung der Listen nach Tags, Tonart und Sprache
- Echtzeit-Transponieren der Tonart und Speichern der benutzerdefinierten Tonart pro Setlist
- Ändern der Reihenfolge von Songs in Setlisten per Drag & Drop
- Viewport-optimierte Präsentationsansicht für Setlisten
- Exportieren von Songs, Setlisten und Liedblättern als PDF und anderen Formaten
- Tastaturkürzel für Navigation und Aktionsbuttons

SongDrive befindet sich noch in der Entwicklung, es werden noch weitere Funktionen hinzukommen. Im [öffentlichen Repository auf GitHub](https://github.com/devmount/SongDrive/issues?q=is%3Aissue+is%3Aopen+label%3Afeature) können geplante Funktionen eingesehen werden.

### Mithelfen

Feedback und Beiträge sind erwünscht! Du kannst mithelfen SongDrive zu verbessern, indem Du Fehler meldest, Verbesserungen vorschlägst oder direkt zur Codebasis oder dieser Dokumentation beiträgst. Details findest Du in den [Beitragsrichtlinien auf GitHub](https://github.com/devmount/SongDrive/blob/main/.github/CONTRIBUTING.md).

## Loslegen

Wenn Du SongDrive kennenlernen möchtest und dafür eine bestehende SongDrive-Installation verwenden willst, musst Du zunächst ein neues Benutzerkonto anlegen. Dazu kann der *Registrieren* Button verwendet werden. Gib einen Namen, eine Emailadresse und ein Passwort an. Sobald ein Administrator deine Registrierung bestätigt und deinem Konto eine Benutzerrolle zugewiesen hat, kannst Du dich anmelden und SongDrive mit den Berechtigungen deiner Rolle nutzen.

### Voraussetzungen

Um SongDrive nutzen zu können, sollten die folgenden Voraussetzungen erfüllt sein:

- Moderner Browser (SongDrive funktioniert am besten in Firefox, Opera und Chrome)
- Internetverbindung beim Start von SongDrive
- Gerät mit einem Bildschirm von mindestens 10" und FHD-Auflösung (empfohlen)

SongDrive ist responsiv und funktioniert auch auf kleineren Bildschirmen, allerdings sind einige Funktionen (z.B. der Präsentationsmodus) speziell für die Darstellung des kompletten Songs ausgelegt, um das Scrollen während der Aufführung zu vermeiden. Das funktioniert am besten auf größeren Bildschirmen.

### Installation

SongDrive ist eine Open Source Software und ist absolut dafür ausgelegt, es selbst zu hosten. Um SongDrive auf dem eigenen Server einzurichten, beachte bitte die Installationshinweise im [README](https://github.com/devmount/SongDrive/blob/main/README.md).

## Benutzerrollen

SongDrive verfügt über eine Rollen- und Rechteverwaltung. Die folgenden Rollen sind implementiert:

- **A**dministrator
- **E**ditor
- **P**erformer
- **B**eobachter

Diese Rollen haben die folgenden Privilegien:

| A | E | P | B |                                                        |
|---|---|---|---|--------------------------------------------------------|
| x | x | x | x | Dashboard, Song- und Setlistübersicht einsehen         |
| x | x | x | x | Songansicht (präsentieren, transponieren, exportieren) |
| x | x | x | x | Setlistansicht (präsentieren, exportieren)             |
| x | x | x |   | Setlisten erstellen und bearbeiten                     |
| x | x | x |   | Tonarten der Songs einer Setlist anpassen              |
| x | x | x |   | Setlisten synchronisieren                              |
| x | x |   |   | Songs erstellen und bearbeiten                         |
| x | x |   |   | Songs und Setlisten löschen                            |
| x |   |   |   | Song Tags erstellen, bearbeiten und löschen            |
| x |   |   |   | Songsprachen erstellen, bearbeiten und löschen         |
| x |   |   |   | Benutzer erstellen, bearbeiten und löschen             |

## Verwendung

SongDrive bietet auf der linken Seite ein Hauptmenü, über das man zu allen Hauptseiten gelangt, wie dem Dashboard, der Übersicht aller Songs und Setlisten, den Profil- und Einstellungsseiten sowie der Übersicht der Shortcuts und dieser Dokumentation.

### Dashboard

Das [Dashboard](/) ist die Startseite, die alle wichtigen Informationen auf einen Blick in verschiedenen Widgets darstellt, z.B.:

- Zahlen über verfügbare und gespielte Songs, Setlisten und Songsprachen
- kürzlich geplante Setlisten
- Beliebteste Songs (basierend auf der Anzahl der Setlisten, die die Songs enthalten) generell und pro Jahr

Es bietet auch nützliche Tools wie Zufallssongs und Grafiken über die Anzahl der gespielten Songs pro Jahr oder die Anzahl der gespielten Setlisten pro Wochentag.

### Songs

Der Menüpunkt [Songs](/songs) bietet eine Liste aller in SongDrive verfügbaren Songs. Oben steht eine Listennavigation zur Verfügung sowie die Möglichkeit, die Liste durch Klick auf die Spaltenüberschriften zu sortieren. Die Liste kann auch in Echtzeit durchsucht (Volltextsuche) und nach Tag, Tonart oder Sprache gefiltert werden.

Per Klick auf einen Song öffnet sich die Songvorschau mit Songtext, Akkorden und einem zweiten Menü auf der linken Seite, welches folgende Funktionen bietet:

- *Bearbeiten*: Öffnet den Bearbeitungsdialog zum Aktualisieren der Songdaten.
- *Klonen*: Öffnet den Neuer-Song-Dialog und befüllt ihn mit den aktuellen Songdaten.
- *Löschen*: Löscht den aktuellen Song. Dies kann derzeit nicht rückgängig gemacht werden.
- *Sprachauswahl*: Zeigt Schaltflächen für alle Sprachen an, für die eine Übersetzung des aktuellen Songs existiert. Jede Übersetzung ist ein eigenständiger Song in SongDrive, welcher im Bearbeitungsdialog zugeordnet werden kann.
- *Akkorde*: Akkorde ein- und ausblenden. Wenn Akkorde angezeigt werden, wird der Song in einer dicktengleichen Schrift gesetzt, um Akkorde und Text korrekt auszurichten. Wenn die Akkorde ausgeblendet sind, wird der Text in einer größeren serifenlosen Schriftart angezeigt. Diese Option wirkt sich auch auf die Präsentationsansicht und den Export aus.
- *Präsentieren*: Öffnet den Song im Präsentationsmodus, der für den Viewport optimiert ist. Dabei wird die Schriftgröße soweit maximiert, dass immer noch der ganze Song angezeigt wird, um zu verhindern, dass beim Aufführen des Songs gescrollt werden muss.
- *Tonart*: Transponiert den Song nach oben oder unten oder setzt ihn auf die Originaltonart zurück.
- *.TXT*: Exportiert den Songs in reinem Textformat
- *.SNG*: Exportiert den Song im SongBeamer-Format, das auch von OpenLP gelesen werden kann
- *.PDF*: Exportiert den Song als PDF-Liedblatt

#### Song-Syntax

Wenn ein Benutzer mindestens die Rolle *Editor* hat, kann dieser über den entsprechenden Button (+) neben dem Menüpunkt *Songs* neue Songs hinzufügen. Um einen Song hinzuzufügen oder zu bearbeiten, muss der Songtext und die Akkorde in SongDrives simplem Song-Syntax-Format angegeben werden.

Die Notation der Songtexte und Akkorde folgt dieser einfachen Regel: Was eingegeben wird, wird auch angezeigt. Füge einfach die **Textzeilen mit den entsprechenden Akkorden über der genauen Silbe** ein. Eine exakte Ausrichtung ist möglich, da SongDrive eine dicktengleiche Schrift für die Darstellung von Liedtexten und Akkorden verwendet. Hänge **zwei Leerzeichen** am Ende jeder Akkordzeile an, damit diese vom System korrekt als Akkordzeilen erkannt werden.

Zusätzlich zum Text und zu den Akkorden können die verschiedenen Songabschnitte mit Markern gekennzeichnet werden. Ein Marker beginnt mit **zwei Bindestrichen, gefolgt von einem Buchstaben**, der den Songabschnitt angibt (z.B. *c* für *Chorus*). Die folgende Tabelle zeigt alle verfügbaren Marker:

| Marker | Beschreibung |
| ------ | ------------ |
| `--v`  | Strophe      |
| `--p`  | Prechorus    |
| `--c`  | Chorus       |
| `--b`  | Bridge       |
| `--i`  | Intro        |
| `--m`  | Mitro        |
| `--o`  | Outro        |

Jedem Songabschnitt kann eine Nummer zu Aufzählung hinzugefügt werden, z.B. `--v1` und `--v2` für zwei verschiedene Strophen. Die Nummern werden aktuell in SongDrive nur für Strophen angezeigt, können aber auch auf alle anderen Songabschnittsmarker angewendet werden. Vor einem Marker sollte immer ein Zeilenumbruch stehen.

Beispiel mit drei verschiedenen Songabschnitten:

```songdrive
--v
 G             C  
Das ist die Strophe
D            G  
Einfach ein Beispieltext

--c
D            C  
Das ist der Refrain
D            C       G  
Einfach ein Beispieltext

--b
 Em  
Das ist die Bridge
C            D  
Einfach ein Beispieltext
```

Beispiel eines Songs mit zwei Strophen:

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
> Versuche, wenn es der Platz erlaubt, für jede Textzeile auch eine Akkordzeile anzugeben (keine Akkordzeilen für Teile mit denselben Akkorden auslassen, z.B. für die zweite Strophe). Ziel ist es, dem Liedinterpreten das Spielen des Liedes so einfach wie möglich zu machen.

Und das war's - mit dieser einfachen Song-Syntax bist du bereit, deine eigenen Songs zu SongDrive hinzuzufügen.

### Setlisten

Der Menüpunkt [Setlisten](/setlists) bietet eine Liste aller in SongDrive verfügbaren Setlisten. Oben steht eine Listennavigation zur Verfügung sowie die Möglichkeit, die Liste durch Klick auf die Spaltenüberschriften zu sortieren. Die Liste kann auch in Echtzeit durchsucht (Setlist-Titel) oder nach Jahr gefiltert werden.

Per Klick auf eine Setlist öffnet die Setlistvorschau, die die aktuelle Liste der zugefügten Songs und ein sekundäres Menü auf der linken Seite zeigt, das die folgenden Funktionen bietet:

- *Bearbeiten*: Öffnet den Bearbeitungsdialog zum Aktualisieren der Setlistdaten.
- *Klonen*: Öffnet den Neue-Setlist-Dialog und befüllt ihn mit den aktuellen Setlist-Daten vor.
- *Löschen*: Löscht die aktuelle Setlist. Dies kann derzeit nicht rückgängig gemacht werden.
- *Sync*: Aktiviert die Synchronisation der Setlist-Präsentation. Wenn aktiv, kann die Präsentationsansicht in anderen Browser-Tabs auf diesem oder anderen Geräten mit der aktuellen Präsentation synchronisiert werden (automatische Songnavigation).
- *Präsentieren*: Öffnet die Setlist im Präsentationsmodus, der für den Viewport optimiert ist. Dabei wird die Schriftgröße soweit maximiert, dass immer ein ganzer Song pro Folie angezeigt wird, um zu verhindern, dass beim Aufführen der Setlist vertikal gescrollt werden muss.
- *Plain*: Exportiert die Liste in reinem Textformat.
- *Markdown*: Exportiert die Liste in [Markdown](https://daringfireball.net/projects/markdown/).
- *Slack*: Exportiert die Liste im [Slack-Format](https://get.slack.help/hc/en-us/articles/202288908-Format-your-messages).
- *Liste*: Exportiert die Liste als PDF.
- *Sheets*: Exportiert die Liedblätter, also alle in der Setlist enthaltenen Songs, als einzelnes PDF mit einem Song pro Seite.

### Konto

Um die Daten in SongDrive zu schützen, müssen sich Benutzer für den Zugriff auf Songs, Setlisten und andere Funktionen authentifizieren. Im Hauptmenü auf der linken Seite gibt es einen *Registrieren* Button, um ein Benutzerkonto anzulegen. Sobald ein Administrator die Registrierung freigibt, kannst du dich im im Hauptmenü anmelden.

#### Profil

Wenn du angemeldet bist, hast du Zugriff auf deine Profilinformationen. Diese findest du, indem du im Hauptmenü [auf deinen Namen](/Profil) klickst. Name, Rolle, E-Mail und Profilbild können eingesehen werden, ebenso wie einige Zahlen darüber, wie viele Setlisten Du erstellt und wie viele Songs Du gespielt habst (die Summe aller Songs deiner Setlisten).

#### Einstellungen

Um deine Profilinformationen zu aktualisieren, besuche die Seite [Einstellungen](/settings). Du kannst deinen Namen und einen Link zu deinem Profilbild einstellen. Hier kannst du auch die Sprache der SongDrive-Oberfläche wählen.

Als Administrator hast du außerdem Zugriff auf zusätzliche Tools zur Benutzerverwaltung, zur Verwaltung der Songsprachen, zur Verwaltung der Song-Tags und zum Export bzw. Import von SongDrive-Daten.

### Info

Der Info-Bereich im Hauptmenü bietet nützliche allgemeine Informationen. Die Seite [Tastaturkürzel](/shortcuts) zeigt verfügbare Hotkeys in verschiedenen Ansichten von SongDrive, z.B. für die Navigation, Suche oder verschiedene Aktionen. Die Seite[Dokumentation](/documentation) gibt einen detaillierten Überblick über SongDrive, seine Nutzung und seine Funktionen. Außerdem befindet sich hier auch der Link zum offiziellen [GitHub Repository](https://github.com/devmount/SongDrive), wo SongDrive heruntergeladen und mitgestaltet werden kann.
