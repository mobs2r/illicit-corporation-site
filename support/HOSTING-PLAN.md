# Server setup and paid hosting boundary

The header gear opens a runtime picker and the existing authenticated Illicit
account/billing screen. The picker does not issue credentials, charge money or
deploy a service. Server setup is manual. No Tebex store exists yet (operator
confirmation, October 19, 2026).

## Accepted deployment shape

- Railway: web/ThreeJS services, shared control plane, billing worker, and
  isolated per-customer API services. Java Minecraft is a TCP candidate, subject
  to template, storage and load testing.
- Separate game host: Garry's Mod, GTA/FiveM/alt:V, MTA, Bedrock, Source games and
  other UDP runtimes. Operator approved split hosting on October 19, 2026.
- A game/runtime in the catalogue is not a tested deployment template. MTA has
  no reviewed adapter. Existing generic adapters do not prove every gamemode.

The current Resupply credential is owner-scoped for capability checks, not a
replacement for the broad legacy economy key. Do not give customers the root
API_SECRET. A hosted customer needs a dedicated environment/database/namespace
boundary and an API key that cannot write another customer's economy. Existing
shared scoped credentials alone do not establish that isolation.

## Before enabling automatic provisioning

1. Operator creates and verifies a Tebex store and confirms this hosting product
   with Tebex. Confirm prices, currency, duration, resource limits, region,
   spending ceiling and refund/cancellation/grace policy. Enter secrets only in
   backend environment variables, never this public repository/browser.
2. Reuse authenticated Illicit account IDs, server ownership and commerce order
   records. Resolve template/package/price IDs server-side from an allowlist.
   Never accept a browser-supplied paid flag, image, Git URL or Railway project ID.
3. Verify Tebex's raw-body webhook signature before parsing; bind the payment to
   the original account/order/package, exact amount/currency and environment.
   Persist a unique webhook inbox/event ID and unique transaction claim.
4. Settle the order and enqueue a durable provisioning job atomically. A browser
   success redirect cannot grant an entitlement or start a deployment.
5. A least-privilege worker deploys only pinned, tested templates to a new
   customer isolation boundary, with bounded CPU/RAM/storage/egress and retry
   limits. Persist provider resource IDs before retries; reconcile ambiguous
   writes rather than creating duplicate services. Never put provisioning tokens
   or customer keys in webhook payloads/logs/public build variables.
6. Generate unique server-side secrets, inject them into the isolated instance,
   store hashes or encrypted recoverable provider state as appropriate, check
   health and cross-tenant denial, then publish connection details to that owner.
7. Process refunds, disputes, renewals and cancellations through idempotent jobs.
   Suspend access under the approved policy; preserve customer worlds/backups.
   Do not delete data as an automatic side effect of a webhook.
8. Run test checkout + replay + failed deployment recovery + tenant isolation +
   refund/grace tests before enabling sales. No production purchase was tested.

Sources:
- https://docs.tebex.io/developers/integration-methods
- https://docs.tebex.io/developers/webhooks/overview
- https://docs.railway.com/networking/tcp-proxy

No paid services or new API keys were created by this UI change.
