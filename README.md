# GK Eng Training

Ginichi Kuramasu's local English phrase bank and quiz app for LP meetings and formal business conversations.

The app is intentionally local-first:

- Open `index.html` in a browser.
- Data is stored in an encrypted browser `localStorage` vault.
- Set a strong passphrase on first use. It cannot be recovered.
- Export encrypted backups regularly if the data matters.
- Do not commit exported learning data or imported chatbot notes.

## Mobile / GitHub Pages

This app can be published as a static GitHub Pages site. The app code is public when published, but learning data stays in each browser's encrypted local vault.

- On desktop, use `Export encrypted backup` before switching devices.
- On mobile, open the GitHub Pages URL, set or enter the vault passphrase, and restore the encrypted backup from the Import screen if needed.
- Add the site to the phone home screen for a standalone app-like experience.
- Keep plaintext exports off GitHub and out of shared folders.

## Supabase Sync

The app can sign in with Supabase Auth and store the encrypted vault in Supabase for PC / phone sync.

- Run `supabase/setup.sql` in the Supabase SQL Editor before using sync.
- The client uses the Supabase project URL and anon key only.
- Never share or commit the `service_role` key, database password, vault passphrase, or plaintext exports.
- Supabase stores only the encrypted vault envelope. The browser still decrypts locally with the vault passphrase.

## Security Model

This is a local-first training app, not a multi-user enterprise system. The current security posture is:

- Phrase data is encrypted at rest in the browser using Web Crypto `AES-GCM`.
- The encryption key is derived from the passphrase using `PBKDF2-SHA256`.
- The app auto-locks after the selected idle period.
- Daily entries, candidates, phrase cards, and imports carry a confidentiality label.
- AI English drafting uses a Supabase Edge Function so the OpenAI API key is never exposed in the browser.
- AI drafting supports `Strict`, `Balanced`, and `Open` policy modes. `Balanced` is the default.
- Encrypted backups can be exported and later restored through the import screen.
- Plaintext JSON export is still available for migration, but requires confirmation.

Important limitations:

- Data is decrypted in browser memory while the app is unlocked.
- Anyone with the passphrase and access to the browser profile can unlock the vault.
- Copying a Codex prompt or exporting plaintext can expose confidential content outside the vault.
- AI drafting sends the selected text to the Supabase Edge Function and then to the OpenAI API. The app can redact terms first, but the user is responsible for choosing the right policy for the material.
- Do not paste LP names, deal names, portfolio details, or fund terms into external tools unless that environment is approved.

## AI Translation Setup

The GitHub Pages app calls `supabase/functions/translate-phrase`. Deploy that Edge Function and set the OpenAI secret in Supabase before using `AI draft English`.

```powershell
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set OPENAI_MODEL=gpt-5.5
supabase functions deploy translate-phrase
```

Recommended policy behavior:

- `Strict`: blocks `highly confidential` AI drafts.
- `Balanced`: allows `confidential` after confirmation and allows `highly confidential` after stronger confirmation, preferably with redaction.
- `Open`: allows broader drafting after confirmation.

Use `Redact terms` for LP names, target names, deal codes, fund terms, emails, and amounts before sending text to the API.

## Main Workflows

1. **Daily Intake**
   - Answer 10 Japanese prompts based on actual LP meetings, dinners, calls, and investor discussions.
   - Saved answers become phrase candidates.

2. **Phrase Bank**
   - Convert candidates into Japanese-to-English phrase cards.
   - Tag each card by context, register, source, and learning status.

3. **Quiz**
   - Review due cards in Japanese-to-English format.
   - Use `Again`, `Hard`, `Good`, `Easy`, or `Mastered`.
   - Mastered cards come back later to confirm retention.

4. **ChatBot Import**
   - Reuse notes from `GK_ChatBot_PJ` by importing text or JSON.
   - The app turns imported notes into phrase candidates, not final cards.

## ChatBot Project Reuse

The chatbot project can feed this English project through a shared import format:

```json
[
  {
    "sourceProject": "GK_ChatBot_PJ",
    "sourcePath": "docs/decision-log/example.md",
    "title": "LP discussion note",
    "sourceQuestionJp": "Original Japanese question, if available",
    "sourceQuestionEn": "Original English question, if available",
    "content": "Japanese intent text or meeting note",
    "context": "LP meeting",
    "confidentiality": "internal",
    "capturedAt": "2026-05-24T00:00:00.000Z"
  }
]
```

Use `scripts/import-chatbot-notes.ps1` to create a local JSON import file from markdown/text notes:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\import-chatbot-notes.ps1
```

The generated JSON goes under `data/imports/` and is ignored by Git. Treat it as private plaintext working data until it is imported into the encrypted vault.

If Codex converts candidates into phrase-card JSON with `sourceQuestionJp`, `sourceQuestionEn`, `jp`, and `en`, paste that JSON into the import screen. Records with `en` are added directly to the phrase bank; records without `en` stay in the candidate inbox.

## Privacy Notes

- Keep real LP names, deal names, portfolio details, fund terms, and confidential facts out of committed files.
- Treat plaintext exports and import files as private working data.
- Prefer encrypted backups over plaintext exports.
- Use candidate status until wording is reviewed and safe to reuse.
