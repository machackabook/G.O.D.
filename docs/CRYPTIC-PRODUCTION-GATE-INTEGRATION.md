# CRYPTIC production-gate integration contract

**Document:** TDOC-GOD-CRYPTIC-INTEGRATION-0001  
**Revision:** 1.0.0  
**Status:** PUBLIC INTERFACE CONTRACT — NOT A PRODUCTION AUTHORITY  
**Related implementation:** [CRYPTIC PR #33](https://github.com/Azazeleous/CRYPTIC/pull/33)  
**Repository boundary:** G.O.D. remains an independent public browser-capability adapter.

## Purpose

This document records the safe integration boundary between G.O.D. (Governing Obedience Divisor) and the CRYPTIC consensus runtime. It makes the production-gate interfaces discoverable without copying private runtime code, credentials, keys, endpoints, validator identities, internal network topology, or private evidence into this public repository.

The CRYPTIC production-gate work adds adapter contracts for externally operated trust, anchoring, justice, and signing services. Those adapters are not proof that the external services have been provisioned or activated.

## System boundary

G.O.D. v5 is a browser capability and explicit-consent gate. It can report browser API availability and perform only its explicitly allowlisted, user-initiated browser checks. It is not:
- the GOD root authority or a source of Ed25519 trust roots;
- a consensus validator, proposal authorizer, or finality service;
- a monotonic sequence-anchor operator;
- a GAIA-JUSTICE policy or evidence authority;
- an HSM/KMS, remote signer, or validator key custodian;
- a substitute for authenticated server-side authorization.

A browser consent receipt is evidence of a local user action under the browser storage threat model. It is not a cryptographic authorization for `gcf.consensus.propose`, a signed governance decision, or consensus finality.

The authoritative production decision remains server-side and independently verifiable. Browser state must never be treated as an authority credential.

## CRYPTIC adapter surface

The related CRYPTIC change introduces the following integration surfaces:

| Surface | Contract represented in CRYPTIC | G.O.D. relationship |
|---|---|---|
| GOD authorization | HTTPS decision client with request digest, nonce, signer identity, short validity, and Ed25519 verification; runtime facade requires explicit authorization of `gcf.consensus.propose` | G.O.D. browser checks do not issue this decision |
| Trust-root pinning | Independently supplied root fingerprint and signer identity; secure root-pin file checks | Never publish root material or fingerprints here |
| Sequence anchor | Signed HTTPS reads/writes, nonce binding, compare-and-swap semantics, ETag/If-Match conflict handling, monotonic sequence checks | Browser local receipts are not this anchor |
| GAIA-JUSTICE | Separate policy and evidence providers with separately pinned signer identities/keys | G.O.D. may display a sanitized status, but cannot invent or replace provider decisions |
| Remote signing | mTLS remote signer adapter; returned Ed25519 signatures are verified locally against a pinned public key | No private signing key enters browser code or this repository |

The code and tests are maintained in CRYPTIC. This document is an interface map, not a duplicate implementation.

## Five production gates and evidence required

### 1. GOD authority and trust-root governance

Required before production activation:
- the actual authoritative GOD service and its approved policy source;
- explicit authorization for the requested capability, including `gcf.consensus.propose`;
- independently communicated root fingerprint and signer identity;
- documented root creation, rotation, revocation, and recovery procedures;
- signed, request-bound decisions with replay protection and bounded validity.

**Current evidence status:** adapter and contract code are represented by CRYPTIC PR #33. The authoritative service, approval record, independently distributed pin, and live signed decision evidence remain external and must be verified.

### 2. Independent monotonic sequence anchor

Required before production activation:
- separately administered HTTPS anchor service;
- independently pinned signer identity/key;
- durable monotonic state with atomic compare-and-swap;
- authenticated, nonce-bound reads and writes;
- demonstrated conflict, rollback, restore, and operator-recovery behavior.

**Current evidence status:** client contract and tests are represented by CRYPTIC PR #33. A live independent service and operational evidence are not established by this public G.O.D. repository.

### 3. GAIA-JUSTICE policy and evidence providers

Required before production activation:
- real policy and evidence endpoints;
- distinct signer identities and independently pinned public keys;
- authoritative datasets, provenance, freshness, and audit trails;
- explicit failure behavior when evidence is absent, stale, invalid, or contradictory.

**Current evidence status:** separate provider adapters are represented by CRYPTIC PR #33. Actual provider deployment, datasets, and live signed evidence remain external.

### 4. Validator fleet and key custody

Required before production activation:
- independently administered validator hosts and unique validator identities;
- HSM/KMS-backed or equivalently reviewed remote key custody;
- mutual TLS, certificate lifecycle, least privilege, and network segmentation;
- multi-host partition, recovery, rotation, and signer-isolation drills;
- independent security review and retained evidence.

**Current evidence status:** remote signer client contract and local signature verification are represented by CRYPTIC PR #33. This does not establish a deployed HSM/KMS, a live validator fleet, or completed independent review.

### 5. Durability and crash recovery

Required before production activation:
- reproducible process-crash recovery tests;
- storage and filesystem review for the actual deployment medium;
- qualified laboratory evidence for power-loss behavior on representative hardware;
- verified recovery, integrity, and rollback behavior after interruption.

**Current evidence status:** CRYPTIC includes process-kill/SQLite WAL recovery tests. A process-kill test is not a physical power-loss test. Physical interruption testing must be conducted and documented by a qualified hardware lab using approved equipment.

## Evidence classification

Use these terms precisely:

- **Implemented:** source code and automated tests exist.
- **CI verified:** the exact commit's required workflow checks passed.
- **Provisioned:** the external service or hardware exists and is configured.
- **Operationally verified:** live signed requests, failure cases, and recovery behavior were observed.
- **Production approved:** the designated independent reviewers accepted the evidence and governance record.

Do not promote an item to a later state merely because an adapter, mock, loopback test, or documentation page exists.

## G.O.D. integration behavior

A future G.O.D. backend integration may expose sanitized, read-only status and evidence references, subject to authenticated access and explicit user intent. It must:
1. identify the issuing service and environment;
2. distinguish unavailable, unsupported, denied, expired, invalid, and verified states;
3. bind any displayed result to a request or evidence identifier;
4. avoid exposing secrets, raw keys, private endpoints, internal hostnames, or personal telemetry;
5. make clear that browser capability status is independent from consensus authorization and finality.

No remote execution, privileged device control, or hidden permission escalation is introduced by this contract.

## Promotion checklist

- [ ] Confirm CRYPTIC PR #33 is merged only after its required CI checks pass.
- [ ] Obtain the authoritative GOD service/policy reference and independent root-pin distribution record.
- [ ] Verify the live monotonic anchor and its CAS/rollback evidence.
- [ ] Verify both GAIA-JUSTICE providers, their separate signers, provenance, and freshness.
- [ ] Complete independent multi-host validator and key-custody review.
- [ ] Obtain qualified physical power-loss and storage durability evidence.
- [ ] Publish only sanitized evidence references and statuses to this public repository.
- [ ] Re-run G.O.D. browser tests and verify the deployed Pages build before marking this integration live.

## Governing invariants

- **Boundary** — Nothing executes beyond its time.
- **Capacity** — Nothing claims capacity without measurement.
- **Correctness** — Nothing claims correctness without verification.
- **Justice** — Nothing claims legitimacy without justification.

**Final status:** INTERFACE DOCUMENTED · EXTERNAL PRODUCTION GATES NOT YET PROVEN LIVE.
