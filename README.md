# Für Milena & Hannes – digitale Bauanleitung

Eine persönliche, interaktive Web-Experience, die eine LEGO-Bauanleitung als digitales Hochzeitsgeschenk präsentiert – inklusive persönlicher Nachrichten an bestimmten Seiten.

## Setup

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000).

## Eigene Inhalte einsetzen

Alles Persönliche ist zentral in [`config/experience.ts`](config/experience.ts) konfiguriert:

- **Namen, Intro-Texte, Hochzeitsdatum** – `couple`, `intro`
- **Die echte Bauanleitung** – ersetze [`public/instructions.pdf`](public/instructions.pdf) durch die echte PDF-Datei (Dateiname beibehalten, oder Pfad in `pdf.file` anpassen). Aktuell liegt dort ein 24-seitiges Platzhalter-Dokument.
- **Persönliche Nachrichten** – Einträge im `messages`-Array, je mit `page`, `type` (`letter` | `short` | `photo` | `surprise`), `title`, `text` und optional `autoOpen`.
- **Abschlusstext** – `completion`.

Die Seitenzahl der Nachrichten muss zur tatsächlichen PDF passen – prüfe das nach dem Austauschen der PDF.

## Architektur

```
app/                  Routen: "/" (Intro) und "/bauen" (Anleitung, ?page=N)
components/
  intro/               Intro-Screen
  pdf-viewer/          react-pdf-Integration, Zoom, Seitenwechsel-Animation
  navigation/          Toolbar, Bottom-Nav, Seitenzähler, Fortschrittsbalken
  messages/            Nachrichten-Indikator, Modal/Bottom-Sheet, Auto-Open-Toast
  completion/          Abschluss-Experience
  experience/          Orchestriert den Gesamtzustand
  ui/                  Wiederverwendbare UI-Bausteine
config/experience.ts   Zentrale Konfiguration aller persönlichen Inhalte
lib/                   Hooks, Types, localStorage-Persistenz
```

Der Fortschritt (aktuelle Seite, Zoom, bereits gesehene Nachrichten) wird in `localStorage` gespeichert; beim erneuten Besuch wird "Weiterbauen" angeboten.

Kein Backend, kein Tracking – alle Inhalte sind statisch im Projekt.
