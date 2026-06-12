# Hochzeits-RSVP & Einladung — Plan

Einmaliges (one-off) digitales Einladungs- und RSVP-System für die Hochzeit,
gehostet als Teil von scn.cx.

## Entscheidungen aus dem Brainstorming (2026-06-12)

| Thema | Entscheidung |
|---|---|
| Umfang | Volle Einladungsseite: Hero, Ablauf, Location/Anreise, Extras (FAQ, Dresscode, Geschenke), RSVP |
| Zugang | Personalisierte Links pro Haushalt (z. B. `scn.cx/hochzeit/?g=a8x2`), Begrüßung mit Namen |
| Speicherung | Google Forms — eigene, schön gestaltete Form auf der Seite postet in eine echte Google Form (Antworten landen im verknüpften Sheet) |
| Sprache / Größe | Nur Deutsch, < 100 Gäste |
| RSVP-Felder | Zusage/Absage pro Person + Unverträglichkeiten/Ernährung pro Person |
| Inhalte | Platzhalter (Namen, Datum, Ort) — zentral markiert, später austauschbar |
| Design | 3 Prototypen, Entscheidung danach |

## Architektur

Komplett statisch, kein eigener Server:

1. **Gästeliste** liegt als statisches JSON im Repo (`gaeste.json`):
   Haushalts-Code → Anzeigename + Personenliste. Codes sind kurz und
   nicht erratbar (z. B. 4 Zeichen). Kein echtes Geheimnis, aber
   ausreichend Privatsphäre für eine Hochzeitsseite.
2. **Personalisierung** läuft clientseitig: `?g=<code>` (oder Pfad) wird
   gegen das JSON aufgelöst, Seite begrüßt den Haushalt, RSVP-Form zeigt
   genau die eingeladenen Personen.
3. **RSVP-Submit**: Die eigene Form sendet per `fetch` (no-cors) an den
   `formResponse`-Endpoint einer Google Form mit vorbereiteten
   `entry.<id>`-Feldern. Antworten erscheinen im Google Sheet.
   - Einrichtung: Google Form mit Feldern (Code, Name, Zusage, Ernährung,
     Nachricht) anlegen, vorausgefüllten Link erzeugen, `entry`-IDs in die
     Site-Config übertragen. Anleitung folgt im Build-Schritt.
4. **Fallback**: Link "Probleme? Direkt zur Google Form" mit
   vorausgefülltem Code, falls der Fetch-Weg je bricht.

## Prototypen

In `src/hochzeit/prototypen/`:

- `a-klassisch.html` — Klassisch elegant: Ivory, Serifen, feine Linien, botanisch
- `b-editorial.html` — Modern/verspielt: große Typo, Farbe, Anklang an die scn.cx-Bannerseite
- `c-minimal.html` — Minimal & warm: viel Weißraum, Creme/Grün/Terracotta (2026-Trend)

Gleicher Inhalt in allen dreien; nach der Entscheidung wird der Gewinner
zur echten Seite unter `src/hochzeit/` ausgebaut (inkl. Gäste-JSON,
Google-Form-Anbindung, echte Inhalte).

## Offene Punkte

- [ ] Design-Entscheidung nach Prototypen-Review
- [ ] Echte Inhalte: Namen, Datum, Location, Ablauf, FAQ-Texte
- [ ] Google Form anlegen + `entry`-IDs eintragen
- [ ] Gästeliste mit Codes befüllen
- [ ] Hosting-Pfad klären (scn.cx/hochzeit oder Subdomain)
