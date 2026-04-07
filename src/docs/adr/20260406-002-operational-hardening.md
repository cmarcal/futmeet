# Add graceful shutdown and database pool configuration

* Status: accepted
* Date: 2026-04-06
* Branch/PR: feat/operational-hardening (closes #37)

## Context and Problem Statement

The API process had no SIGTERM/SIGINT handlers, meaning a container stop or Ctrl+C would kill the process immediately, dropping in-flight requests and leaving the database pool open. The `pg` pool also had no idle or connection timeout, making it vulnerable to connection leaks and slow startup detection.

## Decision Drivers

* Container orchestrators (Docker, Kubernetes) send SIGTERM before SIGKILL — the app must handle it
* Idle connections consume database server resources unnecessarily
* A hung connection attempt at startup should fail fast rather than blocking indefinitely

## Considered Options

* Option A — Handle signals in `src/index.ts`, add timeouts to `createPool`
* Option B — Use a process manager (PM2, tini) for signal forwarding
* Option C — Leave signal handling to the container runtime

## Decision Outcome

Chosen option: **Option A — application-level signal handling**, because it gives the app control over the shutdown sequence (drain requests → close pool) and requires no additional infrastructure dependencies.

### Positive Consequences

* In-flight requests complete before the process exits on SIGTERM/SIGINT
* Idle database connections are released after 30 s, reducing load on the database server
* A 5 s connection timeout makes startup failures immediately visible in logs

### Negative Consequences

* `process.exit(0)` is called explicitly — any uncaught error in the shutdown path would silently succeed

## Pros and Cons of the Options

### Option A — Application-level signal handling

* Good, because the shutdown order (Fastify close → pool drain) is explicit and testable
* Good, because no new runtime dependency
* Bad, because `process.exit` in tests requires care (not an issue here since `src/index.ts` is not unit-tested)

### Option B — Process manager

* Good, because signal forwarding is handled externally
* Bad, because adds PM2/tini to the runtime image; doesn't solve pool config

### Option C — Container runtime only

* Good, because zero code change
* Bad, because SIGKILL after grace period drops connections ungracefully; pool config still unaddressed
