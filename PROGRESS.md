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
- PWA support:
  - `manifest.webmanifest`
  - `service-worker.js`
  - `icons/app-icon.svg`
- Mobile layout support:
  - iPhone / touch devices now force the left desktop navigation into a bottom tab bar.
  - Service worker cache was bumped to `gk-eng-training-v2` so mobile clients pick up the layout fix.

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

- `2774ad4 fix: force mobile bottom navigation`
- `d1910bc feat: add mobile PWA support`
- `ff4ff9c feat: track source questions for phrase cards`

Public Pages repo latest relevant commit:

- `f5f9ef3 fix: force mobile bottom navigation`

GitHub Pages status was confirmed as built, and the public URL returned HTTP 200.

## Known Non-App Issue

During Codex work on Windows, an `Error launching app` dialog appeared.

This was not caused by the web app. It appears to be a Codex / Windows Electron URL handler issue when opening Codex-managed links or browser actions. Avoid using Codex internal link launching for this project; open the public URL directly in Safari / Chrome instead.

## Next Planned Phase: Supabase Login + Encrypted Sync

Goal: allow PC and iPhone to access the same encrypted vault after login.

Implementation has started with Supabase project ref `wvauqvmvsgzhuuvqhkxh`.

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
- Run `supabase/setup.sql` in the Supabase SQL Editor before expecting sync to work.

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
- How to handle first migration from current local vault to Supabase:
  - Option A: export encrypted backup and import after login.
  - Option B: app detects local vault and offers "upload this encrypted vault to Supabase".
- Conflict handling if PC and iPhone edit the vault at the same time.

## Checks Recently Run

- `node --check app.js`
- `node --check service-worker.js`
- `JSON.parse` validation for `manifest.webmanifest`
- `git diff --check`
- GitHub Pages build status check
- HTTP 200 check for the public Pages URL
