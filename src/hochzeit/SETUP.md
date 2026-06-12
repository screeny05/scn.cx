# Einrichtung der Hochzeitsseite

## 1. Inhalte eintragen

Alle Platzhalter (Namen, Datum, Ort, Ablauf, FAQ) stehen in
`index.html` — markiert mit dem TODO-Kommentar oben in der Datei.
Die Rückmeldefrist steht in `js/hochzeit.js` (`CONFIG.frist`).

## 2. Gästeliste pflegen (`gaeste.json`)

Pro Haushalt ein Eintrag:

```json
"tk7m": {
    "anrede": "Liebe Familie Mustermann",
    "personen": ["Max Mustermann", "Erika Mustermann"]
}
```

- Der Schlüssel (`tk7m`) ist der Code für den persönlichen Link:
  **`https://scn.cx/hochzeit/?g=tk7m`** — dieser Link kommt in die
  Einladung (z. B. als QR-Code).
- Codes: 4–6 Zeichen, Kleinbuchstaben + Ziffern, keine verwechselbaren
  Zeichen (0/o, 1/l). Schnell generieren:
  `node -e "console.log(Math.random().toString(36).slice(2,6))"`
- Hinweis: Die Datei ist öffentlich abrufbar. Für eine Hochzeitsseite
  mit <100 Gästen ist das ein akzeptabler Kompromiss — wer es nicht
  möchte, sollte nur Vornamen verwenden.

## 3. Google Form anlegen (einmalig, ~10 Minuten)

1. Auf [forms.google.com](https://forms.google.com) eine neue Form
   „Hochzeit RSVP" anlegen.
2. **Vier Fragen** hinzufügen, alle als Typ **„Kurzantwort"**
   (wichtig: keine Multiple-Choice, sonst verwirft Google unsere Werte):
   1. Code
   2. Name
   3. Teilnahme
   4. Ernährung
3. Einstellungen: „Anmeldung erforderlich" **ausschalten**
   (Antworten ohne Google-Konto erlauben), „Auf 1 Antwort beschränken"
   **ausschalten** (wir senden pro Person einen Eintrag).
4. Unter „Antworten" → Sheets-Symbol: **Google Sheet verknüpfen** —
   dort landen alle Rückmeldungen.
5. **Form-ID kopieren:** Form öffnen („Vorschau"-Auge), die URL sieht so aus:
   `https://docs.google.com/forms/d/e/1FAIpQL…XYZ/viewform`
   → den langen Teil zwischen `/d/e/` und `/viewform` in
   `js/hochzeit.js` bei `formId` eintragen.
6. **entry-IDs ermitteln:** In der Form rechts oben ⋮ →
   „Vorausgefüllten Link abrufen", alle vier Felder mit erkennbaren
   Werten füllen (z. B. „CODE", „NAME", …), „Link abrufen". Der Link
   enthält `entry.123456789=CODE&entry.987654321=NAME…` —
   die vier `entry.…`-Nummern in `js/hochzeit.js` unter
   `CONFIG.googleForm.felder` eintragen (Zuordnung über die Werte).

Solange `formId` leer ist, läuft die Seite im **Demo-Modus**:
Das Formular funktioniert komplett, sendet aber nichts (Antwort wird
nur in der Browser-Konsole geloggt).

## 4. Testen

- `src/` lokal serven (z. B. `npx serve src`) und
  `http://localhost:3000/hochzeit/?g=tk7m` öffnen.
- Ohne `?g=…` oder mit unbekanntem Code erscheint der Hinweis,
  den persönlichen Link zu nutzen.
- Nach dem Absenden merkt sich der Browser die Antwort
  (localStorage) und zeigt die Danke-Ansicht. Zum erneuten Testen:
  DevTools → Application → Local Storage → `rsvp-<code>` löschen.
- Echten Versand testen: `formId` eintragen, einen Test-Code absenden,
  im Google Sheet prüfen, Testzeile löschen.

## Funktionsweise

Komplett statisch, kein Server: Die Seite löst `?g=<code>` clientseitig
gegen `gaeste.json` auf, begrüßt den Haushalt mit Namen und baut das
Formular mit genau den eingeladenen Personen. Beim Absenden wird pro
Person ein POST an den `formResponse`-Endpoint der Google Form
geschickt (`no-cors`) — die Antworten erscheinen im verknüpften Sheet
mit Zeitstempel. Als Fallback gibt es einen Link zur echten Google
Form mit vorausgefülltem Code.
