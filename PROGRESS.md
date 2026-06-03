# GK Eng Training - Progress Log

Last updated: 2026-06-01 JST

## Current State

- Private source repository: `https://github.com/ginichik-oss/gk-eng-training`
- Public GitHub Pages repository: `https://github.com/ginichik-oss/gk-eng-training-pages`
- Public app URL: `https://ginichik-oss.github.io/gk-eng-training-pages/`
- The private source repo remains private.
- The public Pages repo contains only the static app files required to run the browser app.

## What Has Been Implemented

- Local-first English training app for LP / business English practice.
- Encrypted local browser vault using Web Crypto.
- Daily intake, candidate inbox, phrase bank, quiz, import, export, and encrypted backup workflows.
- Original question fields in Japanese and English for phrase cards.
- AI English drafting UI in the candidate editor:
  - `AI draft English` button.
  - `Strict` / `Balanced` / `Open` policy selector.
  - Optional redaction before API use.
  - Confidential and highly confidential confirmation flow.
- Supabase Edge Function scaffold:
  - `supabase/functions/translate-phrase/index.ts`
  - Uses the OpenAI Responses API with `store: false`.
  - Verifies Supabase login before drafting.
  - Keeps the OpenAI API key out of the browser.
- PWA support:
  - `manifest.webmanifest`
  - `service-worker.js`
  - `icons/app-icon.svg`
- Mobile layout support:
  - iPhone / touch devices now force the left desktop navigation into a bottom tab bar.
  - Service worker cache was bumped to `gk-eng-training-v4` so mobile clients pick up current static assets.

## Current Vault Model

The vault is currently stored in each browser's `localStorage`.

- Storage key: `gk-eng-training-secure-v2`
- The app stores an encrypted envelope, not plaintext phrase data.
- The vault passphrase is not stored.
- The decryption key is derived inside the browser only while the app is unlocked.
- When the app locks or reloads, the key is discarded from memory.

In the current version, PC and iPhone do not automatically share data. To move data manually:

1. Export encrypted backup from one device.
2. Import that encrypted backup on another device.
3. Enter the vault passphrase to restore it.

## Deployment Notes

Private source repo latest relevant commits:

- `6b251ee feat: add supabase vault sync`
- `ffe8e4c docs: add project progress log`
- `2774ad4 fix: force mobile bottom navigation`
- `d1910bc feat: add mobile PWA support`
- `ff4ff9c feat: track source questions for phrase cards`

Public Pages repo latest relevant commit:

- `610b84e feat: add supabase vault sync`
- `f5f9ef3 fix: force mobile bottom navigation`

GitHub Pages status was confirmed as built, and the public URL returned HTTP 200.

## AI Translation Phase

Goal: automate the Japanese-to-English drafting step from Daily Q / Inbox to phrase cards while preserving confidentiality controls.

Implemented locally as of 2026-06-01:

- Browser UI now supports AI drafting from the candidate editor.
- Default policy is `Balanced`.
- `confidential` drafts require confirmation.
- `highly confidential` drafts require stronger confirmation.
- `Strict` mode blocks `highly confidential` AI drafts.
- Redaction terms can be entered for LP names, target names, deal codes, fund terms, emails, and amounts.
- Redaction happens in the browser before the Supabase Edge Function call when enabled.
- Supabase Edge Function validates login and calls OpenAI server-side.

Still required before production use:

- `OPENAI_API_KEY` was set in Supabase secrets by the user.
- Optionally set `OPENAI_MODEL`.
- Deploy `translate-phrase` to Supabase Edge Functions.
- Push the updated static files to the public Pages repo.
- Run a live test using a non-sensitive sample first.

Deployment note:

- `npx.cmd supabase --version` succeeded with Supabase CLI `2.102.0`.
- `npx.cmd supabase functions deploy translate-phrase --project-ref wvauqvmvsgzhuuvqhkxh` was attempted, but Supabase CLI requires a local access token.
- Do not paste the Supabase access token into chat. Run `npx.cmd supabase login` locally and paste the token only into the terminal, or deploy the function through the Supabase Dashboard.
- After the user completed Supabase CLI login, `translate-phrase` was deployed successfully to project `wvauqvmvsgzhuuvqhkxh`.
- The deploy command showed `WARNING: Docker is not running`, but the function deployment itself completed successfully.
- Endpoint smoke check reached the deployed function. With anon headers but no signed-in user token, it returned `{"error":"Sign in required"}`, which confirms the function is deployed and enforcing login.
- On 2026-06-03, the live app reached OpenAI but returned a generic OpenAI processing error with request ID `req_006068b13af248909282eb0a2b090c23`.
- The Edge Function source was updated to default to current OpenAI docs guidance (`gpt-5.5`) when `OPENAI_MODEL` is unset, remove the older hard-coded default, and retry transient OpenAI status codes.
- The updated `translate-phrase` function was redeployed successfully on 2026-06-03.

## Known Non-App Issue

During Codex work on Windows, an `Error launching app` dialog appeared.

This was not caused by the web app. It appears to be a Codex / Windows Electron URL handler issue when opening Codex-managed links or browser actions. Avoid using Codex internal link launching for this project; open the public URL directly in Safari / Chrome instead.

## Next Planned Phase: Supabase Login + Encrypted Sync

Goal: allow PC and iPhone to access the same encrypted vault after login.

Implementation has started with Supabase project ref `wvauqvmvsgzhuuvqhkxh`.

Status as of 2026-06-01:

- `supabase/setup.sql` was run in the Supabase SQL Editor.
- Supabase returned `Success. No rows returned`, which is expected for table / policy setup SQL.
- The public GitHub Pages app showed the new Cloud login panel.
- Initial `Create login` attempt hit Supabase's temporary anti-abuse wait message: `For security purposes, you can only request this after 24 seconds.`
- After waiting and retrying, login creation succeeded.
- Next validation: confirm that signing in, creating/opening the vault, saving a phrase, and reopening from another device all use the same encrypted remote vault.

Recommended architecture:

- GitHub Pages:
  - Hosts the static app UI.
- Supabase Auth:
  - Handles login identity, such as email and password.
- Supabase Database:
  - Stores only the encrypted vault envelope.
- Browser:
  - Decrypts the vault locally after the user enters the vault passphrase.

Important security principle:

- Login password controls who can access the stored encrypted vault.
- Vault passphrase controls who can read the vault contents.
- Supabase should never store plaintext notes, plaintext phrase cards, the vault passphrase, or the derived decryption key.

Proposed database table:

```sql
user_vaults
```

Suggested columns:

- `user_id`: Supabase authenticated user ID.
- `encrypted_vault`: JSON payload containing salt, iv, ciphertext, version, and KDF metadata.
- `updated_at`: last update timestamp.
- `client_updated_at`: timestamp from the browser for conflict handling.

Required Supabase security:

- Enable Row Level Security.
- Only allow each logged-in user to select, insert, and update their own vault row.
- `supabase/setup.sql` has been run successfully in the Supabase SQL Editor.

High-level app flow:

1. User logs in with Supabase Auth.
2. App fetches that user's encrypted vault from Supabase.
3. User enters the vault passphrase.
4. Browser derives the decryption key locally.
5. Browser decrypts the vault locally.
6. On save, browser encrypts the updated vault locally.
7. App uploads only the encrypted vault envelope to Supabase.

## Open Decisions Before Supabase Work

- Supabase project selected: `wvauqvmvsgzhuuvqhkxh`.
- Login method selected: email + password.
- Current recommendation retained: keep the login password and vault passphrase separate.
- First migration behavior implemented at a basic level:
  - If a local encrypted vault exists and no remote vault exists after sign-in, opening the local vault triggers a save that uploads the encrypted envelope to Supabase.
  - Manual encrypted backup export / import remains available as a fallback.
- Conflict handling if PC and iPhone edit the vault at the same time.

## Checks Recently Run

- `node --check app.js`
- `node --check service-worker.js`
- `JSON.parse` validation for `manifest.webmanifest`
- `git diff --check`
- GitHub Pages build status check
- HTTP 200 check for the public Pages URL
