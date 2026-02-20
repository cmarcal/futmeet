# Security Assessment – FutMeet (client-only MVP)

This document summarizes a **cybersecurity review** focused on XSS, injection, and client-side data handling. The app currently uses **localStorage** (via Zustand persist) as temporary storage; the assessment assumes migration to a backend later.

---

## 1. Attack vectors considered

### 1.1 Cross-Site Scripting (XSS)

| Vector | Description | Status |
|--------|-------------|--------|
| **Stored XSS via player/team names** | Attacker enters `<script>alert(1)</script>` or similar as player name; data is persisted to localStorage and re-rendered. | **Mitigated** – React escapes all text in JSX (e.g. `{player.name}`, `{team.name}`). No `dangerouslySetInnerHTML`, `innerHTML`, or `eval()` used. |
| **Reflected XSS via URL** | Attacker sends link with malicious `gameId` or `roomId` in path (e.g. `/game/<script>...`). | **Mitigated** – `gameId`/`roomId` are validated with `isValidGameId()` (regex `^[A-Za-z0-9_-]{21}$`) before use; invalid IDs trigger `<Navigate to="/" />`. |
| **DOM-based XSS** | User-controlled data is written into HTML/attributes in an unsafe way. | **Mitigated** – All user-derived content is rendered as React text or passed to `encodeURIComponent` (WhatsApp share URL). |
| **Attribute injection** | e.g. `aria-label="Remover ${player.name}"` – if `player.name` contained `" onclick="..."`, could break attribute. | **Mitigated** – React escapes attribute values. Malicious quotes become literal text. |

### 1.2 Malicious JavaScript injection (other sinks)

- **No** `eval()`, `new Function()`, or `setTimeout/setInterval` with string code.
- **No** `dangerouslySetInnerHTML` or raw `innerHTML`.
- **No** dynamic `<script>` or `document.write` from user input.
- **No** `javascript:` or `data:` URLs built from user input – only `https://wa.me/?text=...` with `encodeURIComponent(shareText)`.

### 1.3 Open redirect / navigation

- All `navigate()` calls use either:
  - App-generated IDs (`generateGameId()`), or
  - Validated route params (`gameId`/`roomId` from `useParams` after `isValidGameId()`).
- No user-supplied URLs used for redirects or `window.open` (except the fixed WhatsApp URL with encoded text).

### 1.4 localStorage tampering

- A user can open DevTools and overwrite `futmeet-games-storage` with arbitrary JSON.
- **Impact**: Corrupted or malicious data (e.g. very long names, special characters) is **rehydrated** into the store and rendered.
- **Mitigation**: React still escapes when rendering; no execution of script. Rehydration does type-fixing (e.g. `timestamp`); it does not sanitize HTML. Adding **input validation/sanitization** at the schema layer (e.g. reject/sanitize names with `<`, `>`) is recommended for **defense in depth** and to avoid broken layout/attributes from odd characters.

### 1.5 SSRF (Server-Side Request Forgery)

- **N/A** for current client-only app – no server-side requests. When you add a backend, ensure that any server-side fetch/redirect uses allowlists and never forwards user-controlled URLs.

### 1.6 Other

- **ErrorFallback**: Displays `getErrorMessage(error)` (fixed app strings) and `error.name`. No user-controlled content rendered.
- **SkipLink**: Static `href="#main-content"` – safe.
- **Team names**: Generated in code (`Time 1`, `Time 2`, …) – not user input.

---

## 2. Summary

- **XSS**: Mitigated by React’s default escaping, validated route params, and no unsafe HTML/script sinks.
- **Injection**: No `eval`/innerHTML; external URL built with `encodeURIComponent`.
- **Navigation**: Only validated or generated IDs.
- **localStorage**: Tampering can only affect data shown in the same origin; rendering remains safe. Schema-level sanitization/validation is recommended for robustness.

---

## 3. Recommendations (now and when you add a backend)

1. **Now (defense in depth)**  
   - In the **player name schema**, reject or sanitize characters that could be used in HTML/script (e.g. `<`, `>`), and keep length limits. This protects against future code changes and odd characters in attributes (e.g. `aria-label`).

2. **When you add a backend**  
   - **Content-Security-Policy (CSP)** header to restrict script sources and reduce impact of any future XSS.  
   - **Validate and sanitize** all inputs on the server; never trust client/localStorage alone.  
   - **Authentication/authorization** – protect game/room resources by user/session.  
   - **Rate limiting** and **CSRF** protection for state-changing requests.  
   - **Secure headers**: e.g. `X-Content-Type-Options: nosniff`, `X-Frame-Options`, and HTTPS only.

3. **Optional**  
   - Add a **small test** that submits names containing `<script>`, `"onclick="`, etc., and asserts they are rendered as plain text (no execution). This documents the threat and guards against regressions.

---

## 4. How to reproduce checks

- **Route param validation**: Open `/game/../../../etc/passwd` or `/game/<script>alert(1)</script>` – app should redirect to `/`.  
- **Stored “XSS”**: Add a player with name `<script>alert(1)</script>` (if allowed by schema) or inject it via DevTools into `localStorage['futmeet-games-storage']`; reload – the string should appear as text, not run.  
- **WhatsApp share**: Add a player with `" test "` and share – URL should be encoded and not change navigation or execute script.
