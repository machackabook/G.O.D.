# Security

This repository is a public browser capability project; never commit secrets, internal hostnames, local IPs, account identifiers, saved authentication sessions, raw user telemetry, private device records, certificates, or proprietary Enclave runtime.

The extension supports only `PING` and `GET_PLATFORM` requests and rejects messages outside the specified hosted G.O.D. route. Platform metadata is returned only on a user-requested call. No remote network bridge is active.

`chrome://flags`, `chrome://extensions`, and other browser internals remain user-controlled and inaccessible to GitHub Pages JavaScript. Do not disable browser security features to make a capability appear available. Static GitHub Pages cannot set custom per-route response headers; frame-ancestors policies must be enforced on a header-capable edge origin if required. Do not rely on client-only authentication to protect sensitive information.
