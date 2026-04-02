# Security Checklist

## Table of Contents
1. [Secrets & Credentials](#1-secrets--credentials)
2. [Injection](#2-injection)
3. [XSS](#3-xss)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [Input Validation](#5-input-validation)
6. [Path Traversal & File Operations](#6-path-traversal--file-operations)
7. [SSRF](#7-ssrf)
8. [Sensitive Data Exposure](#8-sensitive-data-exposure)
9. [Cryptography](#9-cryptography)
10. [Dependency Security](#10-dependency-security)
11. [Race Conditions & Concurrency](#11-race-conditions--concurrency)
12. [Error Handling & Logging](#12-error-handling--logging)

---

## 1. Secrets & Credentials

**What to look for:**

- Hardcoded strings matching patterns: `key`, `secret`, `password`, `token`, `apikey`, `api_key`, `auth`, `credential`, `pass`, `pwd`
- Connection strings with embedded credentials: `postgres://user:pass@host`
- JWT secrets, private keys (look for `-----BEGIN`)
- AWS/GCP/Azure access keys (patterns: `AKIA`, `AIza`)
- `.env` values committed directly in code instead of `process.env.*`
- Secrets passed as default parameter values

**Red flags in TypeScript/Node:**
```typescript
// BAD
const secret = "my-super-secret-jwt-key";
const db = new Pool({ password: "hardcoded123" });

// BAD - secret in default param
function verify(token: string, secret = "fallback-secret") {}
```

**Check:** Any string literal that looks like a random hash, base64 blob, or matches credential naming patterns.

---

## 2. Injection

### SQL Injection
**Highest priority for this codebase** — it uses raw `pg` queries with no ORM.

```typescript
// CRITICAL: string concatenation in query
const result = await db.query(`SELECT * FROM users WHERE id = '${userId}'`);

// CRITICAL: template literal with user input
const q = `SELECT * FROM rooms WHERE name = '${req.body.name}'`;

// SAFE: parameterized query
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

Look for:
- Template literals containing `req.body.*`, `req.params.*`, `req.query.*`, or any user-derived variable
- String concatenation (`+`) building SQL strings
- `query()` calls where the first argument isn't a plain string literal

### Command Injection
```typescript
// CRITICAL
exec(`convert ${req.body.filename} output.png`);
execSync(`git clone ${userInput}`);

// SAFE
execFile('convert', [filename, 'output.png']);
```

Look for: `exec`, `execSync`, `spawn`, `child_process` calls with template literals or user data.

### Template Injection
Look for: template engines (`handlebars`, `ejs`, `pug`) rendering user-controlled templates.

---

## 3. XSS

Primarily relevant in the React frontend (`apps/web`).

```tsx
// CRITICAL
<div dangerouslySetInnerHTML={{ __html: userContent }} />
element.innerHTML = userInput;
document.write(userInput);

// Unsafe URL injection
<a href={userUrl}>Click</a>  // if userUrl can be javascript:...

// SAFE
<div>{userContent}</div>  // React escapes by default
```

Look for:
- `dangerouslySetInnerHTML`
- Direct DOM manipulation: `innerHTML`, `outerHTML`, `document.write`
- `href` / `src` attributes set from user-controlled data without `javascript:` check
- `eval()`, `new Function()`, `setTimeout(string)`

---

## 4. Authentication & Authorization

### Missing auth checks
```typescript
// Missing: route has no auth middleware/hook
fastify.get('/admin/users', async (req, reply) => { ... });

// Check if preHandler or onRequest hook validates token
fastify.get('/admin/users', { preHandler: [authenticate] }, async (req, reply) => { ... });
```

### IDOR (Insecure Direct Object Reference)
```typescript
// BAD: user can access any room by guessing ID
const room = await roomRepo.findById(req.params.id);

// SAFE: scope to authenticated user
const room = await roomRepo.findByIdAndOwner(req.params.id, req.user.id);
```

Look for: repository queries that use `req.params.id` / `req.query.id` without verifying the requesting user owns or has access to that resource.

### JWT / Token misuse
- `jwt.verify()` called without checking the result
- Algorithm set to `"none"` or configurable from outside
- Short expiry not enforced
- Token stored in `localStorage` (XSS risk) instead of `httpOnly` cookie

### Privilege escalation
- Role/permission changes that don't verify the requester's own role
- Mass assignment: spreading `req.body` onto a DB record that contains `role` or `isAdmin`

---

## 5. Input Validation

This codebase uses Fastify JSON schema validation on routes. Check:

- Every `POST`/`PUT`/`PATCH` route has a schema with `body` definition
- `additionalProperties: false` on body schemas (prevents mass assignment)
- `req.params` and `req.query` have schema definitions
- Numeric fields have `minimum`/`maximum` bounds
- String fields have `maxLength` to prevent DoS via large payloads

```typescript
// BAD: no schema
fastify.post('/rooms', async (req, reply) => {
  const room = await roomService.create(req.body);
});

// GOOD
fastify.post('/rooms', {
  schema: {
    body: {
      type: 'object',
      required: ['name'],
      additionalProperties: false,
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 50 }
      }
    }
  }
}, async (req, reply) => { ... });
```

**ReDoS** — regex patterns applied to user input that could cause catastrophic backtracking:
```typescript
// Potentially dangerous
/^(a+)+$/.test(userInput);
```

---

## 6. Path Traversal & File Operations

```typescript
// CRITICAL
const filePath = path.join(__dirname, 'uploads', req.params.filename);
fs.readFile(filePath); // Can read ../../etc/passwd

// SAFE: normalize and check prefix
const safe = path.resolve('./uploads', req.params.filename);
if (!safe.startsWith(path.resolve('./uploads'))) throw new Error('Invalid path');
```

Look for: `fs.readFile`, `fs.writeFile`, `path.join` / `path.resolve` with user-controlled input.

---

## 7. SSRF

```typescript
// CRITICAL: user controls the URL
const response = await fetch(req.body.webhookUrl);
const data = await axios.get(req.query.url);

// SAFE: allowlist domains or validate URL
const url = new URL(req.body.url);
if (!ALLOWED_HOSTS.includes(url.hostname)) throw new Error('Disallowed host');
```

Look for: `fetch`, `axios`, `got`, `http.request` calls where the URL is derived from user input.

---

## 8. Sensitive Data Exposure

### In responses
```typescript
// BAD: returning full user record including password hash
reply.send(user);

// SAFE: explicit field selection
reply.send({ id: user.id, name: user.name });
```

### In logs
```typescript
// BAD
logger.info({ body: req.body }); // may contain passwords
logger.error({ error }); // error may contain stack with sensitive data

// SAFE: redact sensitive fields
logger.info({ userId: req.user.id, action: 'login' });
```

### In error messages
```typescript
// BAD: leaks DB schema / internal paths
reply.send({ error: err.message }); // "column users.password does not exist"

// SAFE
reply.send({ error: 'Internal server error' });
```

---

## 9. Cryptography

**Weak/broken algorithms — flag as HIGH:**
- `MD5`, `SHA1` for password hashing (use `bcrypt`, `argon2`, `scrypt`)
- `DES`, `3DES`, `RC4` for encryption (use AES-256-GCM)
- `Math.random()` for security-sensitive randomness (use `crypto.randomBytes()`)

```typescript
// CRITICAL: predictable token
const token = Math.random().toString(36);

// SAFE
const token = crypto.randomBytes(32).toString('hex');
```

**Hardcoded cryptographic material:**
- Fixed IV/nonce in AES operations (must be random per operation)
- Hardcoded salt for key derivation

---

## 10. Dependency Security

When new packages are added in `package.json`:

1. Check if it's a well-known, maintained package
2. Flag any package with very few downloads or a very recent publish date
3. Look for typosquatting: `expres` instead of `express`, `lodahs` instead of `lodash`
4. Check if `^` or `~` versioning could pull in a compromised future version for critical packages
5. Flag `devDependencies` that get accidentally used in production code

---

## 11. Race Conditions & Concurrency

This codebase uses pessimistic locking (`SELECT FOR UPDATE`) for all write operations. Check:

```typescript
// BAD: read-then-write without lock (TOCTOU)
const room = await roomQuery.findById(id); // no lock
if (room.playerCount < room.maxPlayers) {
  await roomQuery.addPlayer(id, playerId); // race condition
}

// GOOD: lock acquired before read
const room = await roomQuery.findByIdForUpdate(id); // SELECT FOR UPDATE
if (room.playerCount < room.maxPlayers) {
  await roomQuery.addPlayer(id, playerId);
}
```

Also look for:
- Multiple DB operations outside a transaction that should be atomic
- `setTimeout`/`setInterval` callbacks accessing shared mutable state

---

## 12. Error Handling & Logging

- `try/catch` blocks that silently swallow errors: `catch(e) {}`
- Async functions without error handling that could cause unhandled promise rejections
- Stack traces sent to clients in production
- `console.log` with sensitive data left from debugging

```typescript
// BAD: swallowed error
try {
  await db.query(sql);
} catch (e) {} // silent failure, integrity unknown

// BAD: stack trace to client
catch (err) {
  reply.status(500).send({ error: err.stack });
}
```
