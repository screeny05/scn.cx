/**
 * Hochzeits-RSVP — Personalisierung + Google-Form-Anbindung.
 *
 * Gäste öffnen die Seite mit ihrem persönlichen Link (?g=CODE).
 * Der Code wird gegen gaeste.json aufgelöst; das RSVP-Formular zeigt
 * genau die Personen des Haushalts. Beim Absenden wird pro Person
 * ein Eintrag in die Google Form geschrieben (Antworten landen im
 * verknüpften Google Sheet).
 *
 * Einrichtung der Google Form: siehe SETUP.md in diesem Ordner.
 */

const CONFIG = {
    // TODO: Rückmeldefrist (nur Anzeige)
    frist: '1. Juli 2026',

    googleForm: {
        // TODO: Form-ID aus der URL der Google Form eintragen
        // (https://docs.google.com/forms/d/e/<DIESER-TEIL>/viewform).
        // Solange leer, läuft das Formular im Demo-Modus: alles
        // funktioniert, es wird nur nichts gesendet.
        formId: '',

        // TODO: entry-IDs aus dem vorausgefüllten Link der Form (SETUP.md)
        felder: {
            code: 'entry.1000001',
            name: 'entry.1000002',
            teilnahme: 'entry.1000003',
            ernaehrung: 'entry.1000004',
        },
    },
};

const $ = (sel) => document.querySelector(sel);

function gastCode() {
    const code = new URLSearchParams(location.search).get('g');
    return code ? code.trim().toLowerCase() : null;
}

function bindTexte() {
    document.querySelectorAll('[data-bind="frist"]').forEach((el) => {
        el.textContent = CONFIG.frist;
    });
}

function zeige(id) {
    ['rsvp-nocode', 'rsvp-form-wrap', 'rsvp-danke'].forEach((x) => {
        document.getElementById(x).hidden = x !== id;
    });
}

function personBlock(name, idx) {
    const div = document.createElement('div');
    div.className = 'person';
    div.innerHTML = `
        <h3></h3>
        <div class="choices">
            <label><input type="radio" name="p${idx}" value="Ja" /> Ich bin dabei</label>
            <label><input type="radio" name="p${idx}" value="Nein" /> Leider nicht</label>
        </div>
        <input type="text" maxlength="200" placeholder="Unverträglichkeiten / Ernährung (z. B. vegetarisch)" />
    `;
    div.querySelector('h3').textContent = name;
    return div;
}

function formUrl(art) {
    const { formId } = CONFIG.googleForm;
    return `https://docs.google.com/forms/d/e/${formId}/${art}`;
}

async function sendePerson(code, name, teilnahme, ernaehrung) {
    const f = CONFIG.googleForm.felder;
    const body = new URLSearchParams({
        [f.code]: code,
        [f.name]: name,
        [f.teilnahme]: teilnahme,
        [f.ernaehrung]: ernaehrung,
    });
    // no-cors: Google liefert kein lesbares Ergebnis zurück; ein
    // Netzwerkfehler wirft trotzdem, mehr Feedback gibt es nicht.
    await fetch(formUrl('formResponse'), {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });
}

async function init() {
    bindTexte();

    const code = gastCode();
    if (!code) {
        zeige('rsvp-nocode');
        return;
    }

    let gaeste;
    try {
        gaeste = await (await fetch('gaeste.json')).json();
    } catch {
        zeige('rsvp-nocode');
        return;
    }

    const haushalt = gaeste[code];
    if (!haushalt) {
        zeige('rsvp-nocode');
        return;
    }

    document.querySelectorAll('[data-bind="anrede"]').forEach((el) => {
        el.textContent = haushalt.anrede;
    });

    if (localStorage.getItem(`rsvp-${code}`)) {
        zeige('rsvp-danke');
        return;
    }
    zeige('rsvp-form-wrap');

    const container = $('#rsvp-personen');
    haushalt.personen.forEach((name, idx) => {
        container.appendChild(personBlock(name, idx));
    });

    const { formId } = CONFIG.googleForm;
    if (formId) {
        const link = $('#rsvp-fallback-link');
        link.href = `${formUrl('viewform')}?usp=pp_url&${CONFIG.googleForm.felder.code}=${encodeURIComponent(code)}`;
        $('#rsvp-fallback').hidden = false;
    }

    $('#rsvp-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fehler = $('#rsvp-error');
        fehler.hidden = true;

        const bloecke = [...container.querySelectorAll('.person')];
        const antworten = bloecke.map((block, idx) => {
            const gewaehlt = block.querySelector(`input[name="p${idx}"]:checked`);
            block.classList.toggle('person--missing', !gewaehlt);
            return {
                name: haushalt.personen[idx],
                teilnahme: gewaehlt ? gewaehlt.value : null,
                ernaehrung: block.querySelector('input[type="text"]').value.trim(),
            };
        });

        if (antworten.some((a) => !a.teilnahme)) {
            fehler.hidden = false;
            return;
        }

        const button = $('#rsvp-submit');
        button.disabled = true;
        button.textContent = 'Wird gesendet …';

        try {
            if (formId) {
                for (const a of antworten) {
                    await sendePerson(code, a.name, a.teilnahme, a.ernaehrung);
                }
            } else {
                console.warn('Demo-Modus: keine Google-Form-ID konfiguriert, nichts gesendet.', antworten);
            }
            localStorage.setItem(`rsvp-${code}`, JSON.stringify({ am: new Date().toISOString(), antworten }));
            zeige('rsvp-danke');
        } catch {
            button.disabled = false;
            button.textContent = 'Antwort senden';
            fehler.textContent = 'Das Senden hat leider nicht geklappt. Bitte versucht es noch einmal oder nutzt den Link unten.';
            fehler.hidden = false;
            $('#rsvp-fallback').hidden = !formId;
        }
    });
}

init();
