# Add security plugin layer with API key authentication and HTTP security headers

* Status: accepted
* Date: 2026-04-06
* Branch/PR: feat/security-plugin (closes #34)

## Context and Problem Statement

The API had no authentication, no HTTP security headers, and CORS was hardcoded to a single origin. Any client could call any endpoint. How do we add a baseline security layer without introducing user accounts or complex auth infrastructure?

## Decision Drivers

* The frontend is the only intended consumer — API key auth is sufficient for this phase
* HTTP security headers (helmet) are a zero-cost hardening step
* CORS must support multiple origins in production (different envs)
* `format: 'uuid'` JSON Schema validation requires `ajv-formats` to be enabled at Fastify instantiation level

## Considered Options

* Option A — Centralized security Fastify plugin (`src/core/security/index.ts`)
* Option B — Inline middleware per route
* Option C — Reverse proxy handles auth (nginx/Caddy)

## Decision Outcome

Chosen option: **Option A — centralized security plugin**, because it keeps all security concerns in one place, is registered once at the composition root, and is consistent with how other cross-cutting concerns (error handler, swagger) are structured in this codebase.

### Positive Consequences

* All routes are protected by default — opt-out (health check) is explicit
* `ajv-formats` enables `format: 'uuid'` validation globally, unblocking #35 and #36
* `genReqId` gives every request a UUID, improving log correlation

### Negative Consequences

* `API_KEY` becomes a required env var — local dev needs `.env` update
* A single shared API key offers no per-client revocation

## Pros and Cons of the Options

### Option A — Centralized plugin

* Good, because one registration point for all security concerns
* Good, because consistent with existing plugin pattern (registerErrorHandler, registerSwagger)
* Bad, because requires updating `.env.example` and all deployment configs

### Option B — Inline middleware per route

* Good, because granular control per route
* Bad, because easy to forget on new routes; violates DRY

### Option C — Reverse proxy

* Good, because no application code change
* Bad, because adds infrastructure dependency; doesn't solve `ajv-formats` or request ID needs
